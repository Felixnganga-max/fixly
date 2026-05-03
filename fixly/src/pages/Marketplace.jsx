import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useTransition,
  useDeferredValue,
} from "react";
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  X,
  Heart,
  GitCompare,
  Eye,
  Zap,
  Clock,
  ArrowUp,
  ArrowDown,
  Tag,
  Truck,
  RotateCcw,
  Gift,
  Shield,
  Smartphone,
  Laptop,
  ShoppingCart,
  User,
  ArrowRight,
  TrendingUp,
  Package,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllListings, getBrandNames } from "../Hooks/marketplaceApi";
import { useWishlist } from "../Hooks/useWishlist";
import { useCompare } from "../Hooks/useCompare";
import { useRecentlyViewed } from "../Hooks/useRecentlyViewed";

// ─── CONSTANTS ────────────────────────────────────────────────
const CONDITIONS = ["All", "New", "Used", "Refurbished"];
const PRICE_RANGES = [
  { label: "All prices", min: null, max: null },
  { label: "Under 50K", min: null, max: 50000 },
  { label: "50K – 100K", min: 50000, max: 100000 },
  { label: "100K – 200K", min: 100000, max: 200000 },
  { label: "200K+", min: 200000, max: null },
];
const SORT_OPTIONS = [
  { label: "Newest", sortBy: "createdAt", order: "desc" },
  { label: "Oldest", sortBy: "createdAt", order: "asc" },
  { label: "Price ↑", sortBy: "price", order: "asc" },
  { label: "Price ↓", sortBy: "price", order: "desc" },
  { label: "Most viewed", sortBy: "views", order: "desc" },
  { label: "Top rated", sortBy: "rating", order: "desc" },
  { label: "Discount", sortBy: "oldPrice", order: "desc" },
];
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";

// Categories derived strictly from API data
const SIDEBAR_CATEGORIES = [
  { key: "all", label: "All Departments", icon: Grid3X3 },
  { key: "phone", label: "Phones", icon: Smartphone },
  { key: "laptop", label: "Laptops", icon: Laptop },
];

const CONDITION_CONFIG = {
  New: { cls: "bg-emerald-500 text-white", dot: "#10b981" },
  Used: {
    cls: "bg-amber-100 text-amber-800 border border-amber-200",
    dot: "#f59e0b",
  },
  Refurbished: {
    cls: "bg-sky-100 text-sky-800 border border-sky-200",
    dot: "#0ea5e9",
  },
};

// ─── HERO SLIDES (banners only — no fake products) ────────────
const HERO_SLIDES = [
  {
    eyebrow: "Phones · New arrivals",
    headline: "Shop the latest\nsmartphones",
    sub: "Verified. Tested. Ready to go — find your next phone at Fixly.",
    cta: "Shop phones",
    ctaTab: "phones",
    accent: "#f97316",
    bg: "from-orange-950 to-orange-900",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
  },
  {
    eyebrow: "Laptops · Best deals",
    headline: "Power your work\nfor less",
    sub: "Refurbished & new laptops at unbeatable Nairobi prices.",
    cta: "Shop laptops",
    ctaTab: "laptops",
    accent: "#06b6d4",
    bg: "from-slate-900 to-cyan-950",
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80",
  },
  {
    eyebrow: "Verified sellers only",
    headline: "Buy with confidence\nevery time",
    sub: "Every listing on Fixly is reviewed and verified before going live.",
    cta: "Browse all",
    ctaTab: "phones",
    accent: "#10b981",
    bg: "from-emerald-950 to-teal-900",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&auto=format&fit=crop&q=80",
  },
];

// ─── TRUST ITEMS ──────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Truck, title: "Free delivery", sub: "On orders over KES 5,000" },
  { icon: Shield, title: "Order protection", sub: "Secured information" },
  { icon: Gift, title: "Promotion gift", sub: "Special offers weekly" },
  { icon: RotateCcw, title: "Money back", sub: "Return within 30 days" },
];

// ─── COUNTDOWN HOOK ───────────────────────────────────────────
function useCountdown(hours = 12, mins = 0, secs = 0) {
  const [time, setTime] = useState({ h: hours, m: mins, s: secs });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        let { h, m, s } = t;
        s--;
        if (s < 0) {
          s = 59;
          m--;
        }
        if (m < 0) {
          m = 59;
          h--;
        }
        if (h < 0) {
          return { h: 23, m: 59, s: 59 };
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return { ...time, pad };
}

// ─── SKELETON ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
      <div className="w-full h-48 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-gray-100 rounded w-1/4" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-2/5 mt-2" />
        <div className="h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────
function ProductCard({ product, onQuickView, wishlist, compare }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const { isWishlisted, toggle: toggleWishlist } = wishlist;
  const { isComparing, toggle: toggleCompare, count: compareCount } = compare;
  const wishlisted = isWishlisted(pid);
  const comparing = isComparing(pid);
  const cond = CONDITION_CONFIG[product.condition] || CONDITION_CONFIG.Used;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : product.discount;

  return (
    <div className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-50 overflow-hidden flex-shrink-0">
        <img
          src={product.images?.[0] || product.image || FALLBACK_IMG}
          alt={product.name}
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.verified && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900/90 text-emerald-400">
            <ShieldCheck size={8} strokeWidth={2.5} /> OK
          </span>
        )}
        <span
          className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${cond.cls}`}
        >
          {product.condition}
        </span>
        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md hover:bg-orange-500 hover:text-white transition-all"
          >
            Quick view
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product);
            }}
            disabled={!comparing && compareCount >= 4}
            className={`p-1.5 rounded-full shadow-md transition-all ${comparing ? "bg-violet-500 text-white" : "bg-white text-gray-500 hover:text-violet-500"} disabled:opacity-30`}
          >
            <GitCompare size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {product.brand}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={9}
                className={
                  i <= Math.round(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 fill-gray-200"
                }
              />
            ))}
            <span className="text-gray-400 text-[10px] ml-0.5">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-auto">
          <Eye size={9} />
          <span>{product.views || 0} views</span>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="font-mono font-black text-base text-gray-900">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="font-mono text-xs text-gray-400 line-through">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(pid);
            }}
            className={`p-2 rounded-lg border transition-all flex-shrink-0 ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"}`}
          >
            <Heart size={12} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => navigate(`/product/${pid}`)}
            className="flex-1 flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 rounded-lg transition-all duration-200"
          >
            Add to cart <ShoppingCart size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DAILY DEAL CARD ──────────────────────────────────────────
function DailyDealCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const { h, m, s, pad } = useCountdown(
    Math.floor(Math.random() * 12) + 1,
    Math.floor(Math.random() * 59),
    Math.floor(Math.random() * 59),
  );
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : product.discount;
  const available = 20;
  const sold = Math.min(Math.floor((product.views || 5) * 0.6), available - 1);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
      <div
        className="relative h-52 bg-gray-50 overflow-hidden group cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images?.[0] || FALLBACK_IMG}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
        {discount && (
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center">
            <span className="text-[10px] font-black leading-tight text-center">
              {discount}%<br />
              OFF
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {product.brand}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* Stock progress */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
          <span>
            Available:{" "}
            <strong className="text-gray-800">{available - sold}</strong>
          </span>
          <span>
            Sold: <strong className="text-gray-800">{sold}</strong>
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all"
            style={{ width: `${(sold / available) * 100}%` }}
          />
        </div>

        <div className="flex items-baseline gap-2">
          <p className="font-mono font-black text-lg text-orange-600">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="font-mono text-xs text-gray-400 line-through">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>

        {/* Countdown */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Hurry Up! Offers end in:
          </p>
          <div className="flex items-center gap-1">
            {[
              { v: pad(h), l: "DAYS" },
              { v: pad(m), l: "HOURS" },
              { v: pad(s), l: "MINS" },
              { v: "00", l: "SECS" },
            ].map(({ v, l }, i) => (
              <div key={l} className="flex items-center gap-1">
                <div className="flex flex-col items-center">
                  <span className="bg-gray-900 text-white text-xs font-black px-2 py-1 rounded-md tabular-nums min-w-[32px] text-center">
                    {v}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold mt-0.5">
                    {l}
                  </span>
                </div>
                {i < 3 && (
                  <span className="text-gray-400 font-black text-sm mb-3">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate(`/product/${pid}`)}
          className="mt-auto w-full bg-gray-900 hover:bg-orange-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all duration-200"
        >
          View deal →
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR LATEST PRODUCT ROW ───────────────────────────────
function SidebarProduct({ product }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : product.discount;
  return (
    <button
      onClick={() => navigate(`/product/${pid}`)}
      className="flex items-center gap-2.5 group w-full text-left"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={product.images?.[0] || FALLBACK_IMG}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs font-black text-orange-600 font-mono">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="text-[10px] text-gray-400 line-through font-mono">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={8}
            className={`inline ${i <= 3 ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
          />
        ))}
      </div>
    </button>
  );
}

// ─── HERO SLIDER ──────────────────────────────────────────────
function HeroSlider({ onTabChange }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => slide(1), 5000);
    return () => clearInterval(id);
  }, [current]);

  const slide = (dir) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => (c + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
      setAnimating(false);
    }, 300);
  };

  const s = HERO_SLIDES[current];

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-gradient-to-r ${s.bg} min-h-[260px] flex items-center transition-all duration-500`}
    >
      {/* BG image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={s.img}
          alt=""
          className={`w-full h-full object-cover opacity-20 transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-20"}`}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 px-8 py-8 flex-1 transition-all duration-300 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
      >
        <span
          className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{ background: s.accent + "33", color: s.accent }}
        >
          {s.eyebrow}
        </span>
        <h2 className="text-3xl font-black text-white leading-tight whitespace-pre-line">
          {s.headline}
        </h2>
        <p className="text-white/60 text-sm mt-2 max-w-xs leading-relaxed">
          {s.sub}
        </p>
        <button
          onClick={() => onTabChange(s.ctaTab)}
          className="mt-5 inline-flex items-center gap-2 font-black text-sm px-5 py-2.5 rounded-lg transition-all duration-200"
          style={{ background: s.accent, color: "#fff" }}
        >
          {s.cta} <ArrowRight size={14} />
        </button>
      </div>

      {/* Arrows */}
      <button
        onClick={() => slide(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => slide(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
      >
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── GIFT SPECIAL TICKER ──────────────────────────────────────
function GiftTicker() {
  return (
    <div className="bg-white border border-orange-100 rounded-xl flex items-center gap-3 px-4 py-3 overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-lg">
        <Tag size={12} />
        Gift Special
      </div>
      <div className="overflow-hidden flex-1">
        <div className="animate-marquee whitespace-nowrap text-sm text-gray-600">
          🎁 New offers every weekend — verified deals, verified sellers
          &nbsp;&nbsp;&nbsp; 🔥 Use code{" "}
          <strong className="text-orange-500">FIXLY10</strong> for 10% off your
          first order &nbsp;&nbsp;&nbsp; ✅ All listings verified before going
          live on Fixly &nbsp;&nbsp;&nbsp;
        </div>
      </div>
      <button className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-lg transition-all">
        Get coupon
      </button>
    </div>
  );
}

// ─── QUICK VIEW MODAL ─────────────────────────────────────────
function QuickViewModal({ product, onClose, wishlist }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const { isWishlisted, toggle } = wishlist;
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.images?.length ? product.images : [FALLBACK_IMG];
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : product.discount;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const specEntries = product.specs
    ? Object.entries(product.specs).slice(0, 6)
    : [];
  const cond = CONDITION_CONFIG[product.condition] || CONDITION_CONFIG.Used;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {product.brand}
            </p>
            <h2 className="font-bold text-gray-900 text-base leading-tight mt-0.5">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-64 flex-shrink-0 bg-gray-50">
              <div className="relative w-full h-64 overflow-hidden">
                <img
                  src={images[imgIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImgIdx(
                          (i) => (i - 1 + images.length) % images.length,
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow text-gray-700 hover:bg-white transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow text-gray-700 hover:bg-white transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`h-1 rounded-full transition-all ${i === imgIdx ? "w-4 bg-gray-900" : "w-1 bg-gray-400"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-1.5 p-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? "border-orange-500" : "border-transparent"}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMG;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="font-mono font-black text-2xl text-orange-600">
                      KES {product.price.toLocaleString()}
                    </p>
                    {product.oldPrice && (
                      <p className="font-mono text-sm text-gray-400 line-through">
                        KES {product.oldPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {discount && (
                    <p className="text-xs text-orange-500 font-bold mt-0.5">
                      You save {discount}%
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cond.cls}`}
                  >
                    {product.condition}
                  </span>
                  {product.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-emerald-400">
                      <ShieldCheck size={9} /> Verified
                    </span>
                  )}
                </div>
              </div>
              {product.shortDescription && (
                <p className="text-sm text-gray-500 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
              {specEntries.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {specEntries.map(([key, val]) => (
                    <div key={key} className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                        {key}
                      </p>
                      <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">
                        {String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {product.features?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.features.slice(0, 6).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => toggle(pid)}
            className={`p-3 rounded-xl border transition-all ${isWishlisted(pid) ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-400"}`}
          >
            <Heart
              size={16}
              fill={isWishlisted(pid) ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={() => navigate(`/product/${pid}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-xl transition-all duration-200"
          >
            View Full Page <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPARE MODAL ────────────────────────────────────────────
function CompareModal({ items, onClose, onRemove }) {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const allSpecKeys = useMemo(() => {
    const keys = new Set();
    items.forEach((p) => {
      if (p.specs) Object.keys(p.specs).forEach((k) => keys.add(k));
    });
    return [...keys];
  }, [items]);

  const compareRows = [
    { label: "Price", render: (p) => `KES ${p.price.toLocaleString()}` },
    { label: "Condition", render: (p) => p.condition },
    {
      label: "Rating",
      render: (p) => (p.rating > 0 ? `${p.rating.toFixed(1)} / 5` : "—"),
    },
    { label: "Views", render: (p) => p.views?.toLocaleString() || "—" },
    ...allSpecKeys
      .slice(0, 8)
      .map((k) => ({
        label: k,
        render: (p) => (p.specs?.[k] ? String(p.specs[k]) : "—"),
      })),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Compare devices</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <td className="p-4 w-32 text-xs font-bold uppercase tracking-widest text-gray-400 sticky left-0 bg-white z-10">
                  Spec
                </td>
                {items.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <td key={pid} className="p-3 text-center min-w-[180px]">
                      <div className="relative inline-block">
                        <button
                          onClick={() => onRemove(p)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors z-10"
                        >
                          <X size={10} />
                        </button>
                        <img
                          src={p.images?.[0] || FALLBACK_IMG}
                          alt={p.name}
                          className="w-24 h-24 object-cover rounded-xl mx-auto"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMG;
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                        {p.brand}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 leading-tight mt-0.5">
                        {p.name}
                      </p>
                      <button
                        onClick={() => navigate(`/product/${pid}`)}
                        className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
                      >
                        View →
                      </button>
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, idx) => (
                <tr
                  key={row.label}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 capitalize sticky left-0 bg-inherit z-10">
                    {row.label}
                  </td>
                  {items.map((p) => (
                    <td
                      key={p._id || p.id}
                      className="px-4 py-3 text-sm text-center font-mono text-gray-800"
                    >
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── COMPARE BAR ──────────────────────────────────────────────
function CompareBar({ items, onOpen, onRemove, onClear }) {
  if (items.length < 1) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-5 px-4 pointer-events-none">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 pointer-events-auto border border-gray-700">
        <div className="flex items-center gap-2">
          {items.map((p) => (
            <div key={p._id || p.id} className="relative">
              <img
                src={p.images?.[0] || FALLBACK_IMG}
                alt={p.name}
                className="w-9 h-9 rounded-lg object-cover border-2 border-gray-700"
                onError={(e) => {
                  e.target.src = FALLBACK_IMG;
                }}
              />
              <button
                onClick={() => onRemove(p)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
              >
                <X size={8} />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-xs"
            >
              +
            </div>
          ))}
        </div>
        <div className="h-6 w-px bg-gray-700" />
        <p className="text-sm text-gray-300">{items.length} selected</p>
        <button
          onClick={onOpen}
          disabled={items.length < 2}
          className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Compare {items.length >= 2 ? "→" : `(need ${2 - items.length} more)`}
        </button>
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── MAIN MARKETPLACE ─────────────────────────────────────────
export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const tab = searchParams.get("tab") || "all";
  const brand = searchParams.get("brand") || "All";
  const condition = searchParams.get("condition") || "All";
  const priceRange = parseInt(searchParams.get("price") || "0");
  const sortIdx = parseInt(searchParams.get("sort") || "0");
  const search = searchParams.get("q") || "";

  const setParam = (key, val, defaultVal) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (val === defaultVal || val === null || val === undefined)
          next.delete(key);
        else next.set(key, val);
        return next;
      },
      { replace: true },
    );
  };

  const setTab = (v) => startTransition(() => setParam("tab", v, "all"));
  const setBrand = (v) => setParam("brand", v, "All");
  const setCondition = (v) => setParam("condition", v, "All");
  const setPriceRange = (v) => setParam("price", v, 0);
  const setSortIdx = (v) => setParam("sort", v, 0);
  const setSearch = (v) => setParam("q", v, "");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [allListings, setAllListings] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [brands, setBrands] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const wishlist = useWishlist();
  const compare = useCompare();
  const { ids: recentIds } = useRecentlyViewed();
  const deferredSearch = useDeferredValue(search);

  // Derive brands from fetched data
  useEffect(() => {
    if (allListings.length > 0) {
      const uniqueBrands = [
        "All",
        ...new Set(allListings.map((p) => p.brand).filter(Boolean)),
      ];
      setBrands(uniqueBrands);
    }
  }, [allListings]);

  const fetchListings = useCallback(
    async (cursor = null) => {
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      setError("");

      const sort = SORT_OPTIONS[sortIdx] || SORT_OPTIONS[0];
      const range = PRICE_RANGES[priceRange];

      // Map tab → API category param
      const categoryParam =
        tab === "phones" ? "phone" : tab === "laptops" ? "laptop" : undefined;

      const params = {
        limit: 24,
        sortBy: sort.sortBy,
        order: sort.order,
        ...(categoryParam && { category: categoryParam }),
        ...(brand !== "All" && { brand }),
        ...(condition !== "All" && { condition }),
        ...(range.min !== null && { minPrice: range.min }),
        ...(range.max !== null && { maxPrice: range.max }),
        ...(deferredSearch.trim() && { search: deferredSearch.trim() }),
        ...(cursor && { cursor }),
      };

      try {
        const res = await getAllListings(params);
        if (cursor) {
          setAllListings((prev) => [...prev, ...res.data]);
        } else {
          setAllListings(res.data);
        }
        setNextCursor(res.nextCursor || null);
        setHasNext(res.hasNext || false);
      } catch (err) {
        setError(err.message || "Failed to load listings");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [tab, brand, condition, priceRange, sortIdx, deferredSearch],
  );

  useEffect(() => {
    fetchListings(null);
  }, [fetchListings]);

  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasNext) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore && nextCursor)
          fetchListings(nextCursor);
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNext, loadingMore, nextCursor, fetchListings]);

  // Derived sections from real data
  const phones = useMemo(
    () => allListings.filter((p) => p.category === "phone"),
    [allListings],
  );
  const laptops = useMemo(
    () => allListings.filter((p) => p.category === "laptop"),
    [allListings],
  );
  const deals = useMemo(
    () => allListings.filter((p) => p.oldPrice || p.discount),
    [allListings],
  );
  const trending = useMemo(
    () => [...allListings].sort((a, b) => (b.views || 0) - (a.views || 0)),
    [allListings],
  );
  const latestProducts = useMemo(
    () =>
      [...allListings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
    [allListings],
  );

  const activeFilters =
    (brand !== "All" ? 1 : 0) +
    (condition !== "All" ? 1 : 0) +
    (priceRange !== 0 ? 1 : 0) +
    (sortIdx !== 0 ? 1 : 0);
  const clearFilters = () => {
    setBrand("All");
    setCondition("All");
    setPriceRange(0);
    setSortIdx(0);
  };

  const pill =
    "px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap";
  const pillOn = "bg-orange-500 text-white border-orange-500";
  const pillOff =
    "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500";

  // Active listing display
  const displayedListings = useMemo(() => {
    if (tab === "phones") return phones;
    if (tab === "laptops") return laptops;
    return allListings;
  }, [tab, phones, laptops, allListings]);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── TOPBAR ─────────────────────────────────────────── */}
      <div className="bg-gray-900 text-white text-[11px] py-1.5 px-4 flex items-center justify-between">
        <span className="text-gray-400">
          Welcome to Fixly! Verified phones & laptops — Nairobi's best
          marketplace
        </span>
        <div className="flex items-center gap-4 text-gray-400">
          <span className="flex items-center gap-1">
            <User size={11} /> Login or Register
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <ShieldCheck size={11} /> Track My Order
          </span>
        </div>
      </div>

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-black text-lg text-gray-900">Fixly</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search phones, laptops, brands…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:border-orange-400 transition-colors text-gray-900"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-600">
            {[
              ["all", "All"],
              ["phones", "Phones"],
              ["laptops", "Laptops"],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTab(val)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${tab === val ? "text-orange-500 bg-orange-50" : "hover:text-orange-500 hover:bg-orange-50"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {wishlist.count > 0 && (
              <div className="relative">
                <Heart size={20} className="text-gray-600" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {wishlist.count}
                </span>
              </div>
            )}
            {compare.count > 0 && (
              <div className="relative">
                <GitCompare size={20} className="text-gray-600" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {compare.count}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-5">
          {/* ── SIDEBAR ────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-0 w-52 flex-shrink-0">
            {/* Categories */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 mb-4">
              <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="w-4 h-0.5 bg-white rounded" />
                  <span className="w-3 h-0.5 bg-white rounded" />
                  <span className="w-4 h-0.5 bg-white rounded" />
                </div>
                <span className="text-sm font-black">All Departments</span>
              </div>
              {SIDEBAR_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count =
                  cat.key === "all"
                    ? allListings.length
                    : cat.key === "phone"
                      ? phones.length
                      : laptops.length;
                return (
                  <button
                    key={cat.key}
                    onClick={() =>
                      setTab(
                        cat.key === "phone"
                          ? "phones"
                          : cat.key === "laptop"
                            ? "laptops"
                            : "all",
                      )
                    }
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-b border-gray-50 last:border-0 group ${
                      tab === cat.key ||
                      (cat.key === "phone" && tab === "phones") ||
                      (cat.key === "laptop" && tab === "laptops") ||
                      (cat.key === "all" && tab === "all")
                        ? "bg-orange-50 text-orange-600 font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-orange-500 font-medium"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} />
                      {cat.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      {count > 0 && <span>{count}</span>}
                      <ChevronRight size={11} />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Latest Products */}
            {latestProducts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                    Latest Products
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-3">
                  {latestProducts.map((p) => (
                    <SidebarProduct key={p._id || p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <Icon
                    size={20}
                    className="text-orange-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── MAIN CONTENT ─────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Hero slider */}
            {!search.trim() && (
              <HeroSlider
                onTabChange={(t) =>
                  setTab(t === "phones" ? "phones" : "laptops")
                }
              />
            )}

            {/* Gift ticker */}
            {!search.trim() && <GiftTicker />}

            {/* Daily deals (only show listings with discounts) */}
            {!search.trim() && deals.length > 0 && !loading && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      Daily Deals
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-all">
                      <ChevronLeft size={14} />
                    </button>
                    <button className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-all">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deals.slice(0, 2).map((p) => (
                    <DailyDealCard
                      key={p._id || p.id}
                      product={p}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Trending items */}
            {!search.trim() && trending.length > 0 && !loading && (
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp size={11} /> Trending Items
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTab("all")}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${tab === "all" ? "bg-orange-500 text-white" : "text-gray-500 hover:text-orange-500"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTab("phones")}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${tab === "phones" ? "bg-orange-500 text-white" : "text-gray-500 hover:text-orange-500"}`}
                    >
                      Phones
                    </button>
                    <button
                      onClick={() => setTab("laptops")}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${tab === "laptops" ? "bg-orange-500 text-white" : "text-gray-500 hover:text-orange-500"}`}
                    >
                      Laptops
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {trending.slice(0, 8).map((p) => (
                    <ProductCard
                      key={p._id || p.id}
                      product={p}
                      onQuickView={setQuickViewProduct}
                      wishlist={wishlist}
                      compare={compare}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── ALL LISTINGS SECTION ────────────────────── */}
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap bg-white border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-800">
                    {search.trim()
                      ? `Results for "${search}"`
                      : tab === "phones"
                        ? "All Phones"
                        : tab === "laptops"
                          ? "All Laptops"
                          : "All Listings"}
                  </span>
                  {!loading && (
                    <span className="text-xs text-gray-400">
                      ({displayedListings.length})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${showFilters || activeFilters > 0 ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
                  >
                    <SlidersHorizontal size={12} />
                    Filters
                    {activeFilters > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white text-orange-500 text-[10px] font-black flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                  </button>
                  <div className="relative">
                    <select
                      value={sortIdx}
                      onChange={(e) => setSortIdx(Number(e.target.value))}
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 pr-7 outline-none hover:border-orange-300 transition-colors cursor-pointer"
                    >
                      {SORT_OPTIONS.map((o, i) => (
                        <option key={i} value={i}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ArrowUpDown
                      size={10}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Filter panel */}
              {showFilters && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 flex flex-col gap-4">
                  {[
                    {
                      title: "Brand",
                      items: brands,
                      active: brand,
                      set: setBrand,
                    },
                    {
                      title: "Condition",
                      items: CONDITIONS,
                      active: condition,
                      set: setCondition,
                    },
                  ].map(({ title, items, active, set }) => (
                    <div key={title}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        {title}
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {items.map((item) => (
                          <button
                            key={item}
                            onClick={() => set(item)}
                            className={`${pill} ${active === item ? pillOn : pillOff}`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      Price range
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {PRICE_RANGES.map((r, i) => (
                        <button
                          key={r.label}
                          onClick={() => setPriceRange(i)}
                          className={`${pill} ${priceRange === i ? pillOn : pillOff}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeFilters > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-800 transition-colors w-fit font-medium"
                    >
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : displayedListings.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center">
                  <Package size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-900 text-lg mb-1">
                    No listings found
                  </p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your filters or search term.
                  </p>
                  {activeFilters > 0 && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm font-bold text-orange-500 hover:text-orange-700 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {displayedListings.map((p) => (
                      <ProductCard
                        key={p._id || p.id}
                        product={p}
                        onQuickView={setQuickViewProduct}
                        wishlist={wishlist}
                        compare={compare}
                      />
                    ))}
                  </div>
                  <div ref={sentinelRef} className="h-4" />
                  {loadingMore && (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  )}
                  {!hasNext && displayedListings.length > 0 && (
                    <p className="text-center text-xs text-gray-400 py-6 font-medium">
                      All {displayedListings.length} listings loaded
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────────── */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          wishlist={wishlist}
        />
      )}
      {showCompare && (
        <CompareModal
          items={compare.items}
          onClose={() => setShowCompare(false)}
          onRemove={compare.toggle}
        />
      )}
      <CompareBar
        items={compare.items}
        onOpen={() => setShowCompare(true)}
        onRemove={compare.toggle}
        onClear={compare.clear}
      />

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; animation: marquee 20s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
