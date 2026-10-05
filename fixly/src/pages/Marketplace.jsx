import {
  useState,
  useMemo,
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
  Truck,
  RotateCcw,
  Gift,
  Shield,
  Smartphone,
  Laptop,
  ShoppingCart,
  ArrowRight,
  Package,
  SlidersHorizontal,
  Grid3X3,
  ArrowUpDown,
  Wallet,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllListings } from "../Hooks/marketplaceApi";
import { useWishlist } from "../Hooks/useWishlist";
import { useCompare } from "../Hooks/useCompare";

/*
 * PALETTE (from Navbar.jsx) — defined once in the <style> block at the bottom
 * on .mp-root and used everywhere as var(--mp-*).
 *
 * URL params this page understands (the home page links here):
 *   tab=phones|laptops   minPrice=<KES>   maxPrice=<KES>
 *   brand  condition  sort  q
 */

// ─── CONSTANTS ────────────────────────────────────────────────
const CONDITIONS = ["All", "New", "Used", "Refurbished"];

// Budget chips. min/max null = open ended. Same set as the home page.
const BUDGETS = [
  { label: "10K – 20K", min: 10000, max: 20000 },
  { label: "20K – 30K", min: 20000, max: 30000 },
  { label: "30K – 40K", min: 30000, max: 40000 },
  { label: "40K+", min: 40000, max: null },
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
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

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
    bg: "from-[#f0c09b] to-[#e89454]",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
  },
  {
    eyebrow: "Laptops · Best deals",
    headline: "Power your work\nfor less",
    sub: "Refurbished & new laptops at unbeatable Nairobi prices.",
    cta: "Shop laptops",
    ctaTab: "laptops",
    bg: "from-[#f7e6d9] to-[#f0c09b]",
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80",
  },
  {
    eyebrow: "Verified sellers only",
    headline: "Buy with confidence\nevery time",
    sub: "Every listing on Fixly is reviewed and verified before going live.",
    cta: "Browse all",
    ctaTab: "phones",
    bg: "from-[#e89454] to-[#d4793a]",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&auto=format&fit=crop&q=80",
  },
];

const TRUST_ITEMS = [
  { icon: Truck, title: "Free delivery", sub: "On orders over KES 5,000" },
  { icon: Shield, title: "Order protection", sub: "Secured information" },
  { icon: Gift, title: "Promotion gift", sub: "Special offers weekly" },
  { icon: RotateCcw, title: "Money back", sub: "Return within 30 days" },
];

const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

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
    <div className="bg-[var(--mp-card)] rounded-xl overflow-hidden animate-pulse border border-[var(--mp-line)]">
      <div className="w-full aspect-square bg-[var(--mp-wash2)]" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-[var(--mp-wash2)] rounded w-1/4" />
        <div className="h-3 bg-[var(--mp-wash2)] rounded w-3/4" />
        <div className="h-5 bg-[var(--mp-wash2)] rounded w-2/5 mt-2" />
        <div className="h-8 bg-[var(--mp-wash2)] rounded-lg" />
      </div>
    </div>
  );
}

// ─── BUDGET BAR ───────────────────────────────────────────────
function BudgetBar({ min, max, onChange }) {
  const [lo, setLo] = useState(min ?? "");
  const [hi, setHi] = useState(max ?? "");

  // keep inputs in sync when a chip / the URL changes the budget
  useEffect(() => {
    setLo(min ?? "");
    setHi(max ?? "");
  }, [min, max]);

  const isAll = min === null && max === null;
  const apply = () => onChange(num(lo), num(hi));

  return (
    <div className="bg-[var(--mp-card)] border border-[var(--mp-line)] rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[var(--mp-accent)] text-[var(--mp-ink)] flex items-center justify-center">
            <Wallet size={16} />
          </span>
          <div>
            <h2 className="font-black text-[var(--mp-ink)] text-base leading-tight">
              Shop by budget
            </h2>
            <p className="text-[11px] text-[var(--mp-muted)]">
              Pick a range or type your own.
            </p>
          </div>
        </div>
        {!isAll && (
          <button
            onClick={() => onChange(null, null)}
            className="flex items-center gap-1 text-xs font-bold text-[var(--mp-muted)] hover:text-[var(--mp-ink)]"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Chips — swipe sideways on small screens */}
      <div className="mp-noscroll flex gap-2.5 overflow-x-auto pb-1 mb-3">
        <button
          onClick={() => onChange(null, null)}
          className={`flex-1 min-w-[110px] px-4 py-3 rounded-xl border font-mono font-black text-sm transition-all ${
            isAll
              ? "bg-[var(--mp-ink)] text-white border-[var(--mp-ink)]"
              : "bg-[var(--mp-wash)] text-[var(--mp-ink)] border-[var(--mp-line)] hover:border-[var(--mp-accent)]"
          }`}
        >
          Any price
        </button>
        {BUDGETS.map((b) => {
          const on = min === b.min && max === b.max;
          return (
            <button
              key={b.label}
              onClick={() => onChange(b.min, b.max)}
              className={`flex-1 min-w-[110px] px-4 py-3 rounded-xl border font-mono font-black text-sm transition-all ${
                on
                  ? "bg-[var(--mp-accent)] text-[var(--mp-ink)] border-[var(--mp-accent)]"
                  : "bg-[var(--mp-wash)] text-[var(--mp-ink)] border-[var(--mp-line)] hover:border-[var(--mp-accent)]"
              }`}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {/* Custom range */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          ["Min", lo, setLo],
          ["Max", hi, setHi],
        ].map(([ph, val, set], i) => (
          <div key={ph} className="flex items-center gap-2 flex-1 min-w-[130px]">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--mp-muted)] font-mono pointer-events-none">
                KES
              </span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder={ph}
                value={val}
                onChange={(e) => set(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && apply()}
                className="w-full bg-white border border-[var(--mp-tint)] rounded-lg pl-11 pr-3 py-2.5 text-sm font-mono outline-none focus:border-[var(--mp-accent)] text-[var(--mp-ink)]"
              />
            </div>
            {i === 0 && (
              <span className="text-[var(--mp-muted)] text-xs">to</span>
            )}
          </div>
        ))}
        <button
          onClick={apply}
          className="flex items-center justify-center gap-1.5 bg-[var(--mp-ink)] hover:bg-[var(--mp-ink-soft)] text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all w-full sm:w-auto"
        >
          Apply <ArrowRight size={14} />
        </button>
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
    <div className="group bg-[var(--mp-card)] border border-[var(--mp-line)] rounded-xl overflow-hidden hover:border-[var(--mp-tint)] hover:shadow-lg transition-all duration-300 flex flex-col h-full relative min-w-0">
      {/* Image — square, contain: the whole device is visible */}
      <div className="relative w-full aspect-square bg-white overflow-hidden flex-shrink-0">
        <img
          src={product.images?.[0] || product.image || FALLBACK_IMG}
          alt={product.name}
          draggable={false}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-[var(--mp-accent)] text-[var(--mp-ink)] text-[10px] font-black px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.verified && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--mp-ink)] text-emerald-400">
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
            className="bg-[var(--mp-card)] text-[var(--mp-ink)] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md hover:bg-[var(--mp-accent)] transition-all"
          >
            Quick view
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product);
            }}
            disabled={!comparing && compareCount >= 4}
            className={`p-1.5 rounded-full shadow-md transition-all ${comparing ? "bg-[var(--mp-ink)] text-white" : "bg-[var(--mp-card)] text-[var(--mp-muted)] hover:text-[var(--mp-ink)]"} disabled:opacity-30`}
          >
            <GitCompare size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--mp-muted)]">
          {product.brand}
        </p>
        <h3 className="font-semibold text-[var(--mp-ink)] text-sm leading-snug line-clamp-2">
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
                    : "text-[var(--mp-tint)] fill-[var(--mp-tint)]"
                }
              />
            ))}
            <span className="text-[var(--mp-muted)] text-[10px] ml-0.5">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-[var(--mp-muted)] mt-auto">
          <Eye size={9} />
          <span>{product.views || 0} views</span>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="font-mono font-black text-base text-[var(--mp-ink)]">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="font-mono text-xs text-[var(--mp-muted)] line-through">
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
            className={`p-2 rounded-lg border transition-all flex-shrink-0 ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-[var(--mp-tint)] text-[var(--mp-muted)] hover:text-red-400 hover:border-red-200"}`}
          >
            <Heart size={12} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => navigate(`/product/${pid}`)}
            className="flex-1 flex items-center justify-center gap-1 bg-[var(--mp-accent)] hover:bg-[var(--mp-accent-dark)] text-[var(--mp-ink)] font-bold text-xs py-2 rounded-lg transition-all duration-200"
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
    <div className="bg-[var(--mp-card)] border border-[var(--mp-line)] rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <div
        className="relative w-full aspect-square bg-white overflow-hidden group cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={product.images?.[0] || FALLBACK_IMG}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
        {discount && (
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[var(--mp-accent)] text-[var(--mp-ink)] flex items-center justify-center">
            <span className="text-[10px] font-black leading-tight text-center">
              {discount}%<br />
              OFF
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--mp-muted)]">
          {product.brand}
        </p>
        <h3 className="font-semibold text-[var(--mp-ink)] text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="text-xs text-[var(--mp-muted)] line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between text-[10px] text-[var(--mp-muted)] mt-1">
          <span>
            Available:{" "}
            <strong className="text-[var(--mp-ink-soft)]">
              {available - sold}
            </strong>
          </span>
          <span>
            Sold: <strong className="text-[var(--mp-ink-soft)]">{sold}</strong>
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--mp-wash2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--mp-accent)] rounded-full transition-all"
            style={{ width: `${(sold / available) * 100}%` }}
          />
        </div>

        <div className="flex items-baseline gap-2">
          <p className="font-mono font-black text-lg text-[var(--mp-accent-ink)]">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="font-mono text-xs text-[var(--mp-muted)] line-through">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-[var(--mp-muted)] uppercase tracking-wider">
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
                  <span className="bg-[var(--mp-ink)] text-white text-xs font-black px-2 py-1 rounded-md tabular-nums min-w-[32px] text-center">
                    {v}
                  </span>
                  <span className="text-[8px] text-[var(--mp-muted)] font-bold mt-0.5">
                    {l}
                  </span>
                </div>
                {i < 3 && (
                  <span className="text-[var(--mp-muted)] font-black text-sm mb-3">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate(`/product/${pid}`)}
          className="mt-auto w-full bg-[var(--mp-ink)] hover:bg-[var(--mp-accent)] text-white hover:text-[var(--mp-ink)] font-bold text-xs py-2.5 rounded-lg transition-all duration-200"
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
  return (
    <button
      onClick={() => navigate(`/product/${pid}`)}
      className="flex items-center gap-2.5 group w-full text-left"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-[var(--mp-line)] flex-shrink-0">
        <img
          src={product.images?.[0] || FALLBACK_IMG}
          alt={product.name}
          className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--mp-ink-soft)] line-clamp-1 group-hover:text-[var(--mp-accent-ink)] transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs font-black text-[var(--mp-accent-ink)] font-mono">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="text-[10px] text-[var(--mp-muted)] line-through font-mono">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={8}
            className={`inline ${i <= 3 ? "text-amber-400 fill-amber-400" : "text-[var(--mp-tint)] fill-[var(--mp-tint)]"}`}
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
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={s.img}
          alt=""
          className={`w-full h-full object-cover mix-blend-multiply transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-20"}`}
        />
      </div>

      <div
        className={`relative z-10 px-8 py-8 flex-1 transition-all duration-300 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
      >
        <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 bg-black/10 text-[var(--mp-ink)]">
          {s.eyebrow}
        </span>
        <h2 className="text-3xl font-black text-[var(--mp-ink)] leading-tight whitespace-pre-line">
          {s.headline}
        </h2>
        <p className="text-[var(--mp-ink-soft)] text-sm mt-2 max-w-xs leading-relaxed">
          {s.sub}
        </p>
        <button
          onClick={() => onTabChange(s.ctaTab)}
          className="mt-5 inline-flex items-center gap-2 font-black text-sm px-5 py-2.5 rounded-lg transition-all duration-200 bg-[var(--mp-ink)] text-[var(--mp-bg)] hover:bg-[var(--mp-ink-soft)]"
        >
          {s.cta} <ArrowRight size={14} />
        </button>
      </div>

      <button
        onClick={() => slide(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-[var(--mp-ink)] flex items-center justify-center transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => slide(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-[var(--mp-ink)] flex items-center justify-center transition-all"
      >
        <ChevronRight size={16} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-[var(--mp-ink)]" : "w-1.5 bg-black/30"}`}
          />
        ))}
      </div>
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[var(--mp-card)] w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--mp-line)]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--mp-muted)]">
              {product.brand}
            </p>
            <h2 className="font-bold text-[var(--mp-ink)] text-base leading-tight mt-0.5">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--mp-wash)] text-[var(--mp-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-80 flex-shrink-0 bg-white">
              <div className="relative w-full aspect-square overflow-hidden">
                <img
                  src={images[imgIdx]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain p-3"
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow text-[var(--mp-ink-soft)] hover:bg-white transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow text-[var(--mp-ink-soft)] hover:bg-white transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`h-1 rounded-full transition-all ${i === imgIdx ? "w-4 bg-[var(--mp-ink)]" : "w-1 bg-[var(--mp-muted)]"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mp-noscroll flex gap-1.5 p-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 bg-white transition-all ${i === imgIdx ? "border-[var(--mp-accent)]" : "border-[var(--mp-line)]"}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-contain"
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
                    <p className="font-mono font-black text-2xl text-[var(--mp-accent-ink)]">
                      KES {product.price.toLocaleString()}
                    </p>
                    {product.oldPrice && (
                      <p className="font-mono text-sm text-[var(--mp-muted)] line-through">
                        KES {product.oldPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {discount && (
                    <p className="text-xs text-[var(--mp-accent-ink)] font-bold mt-0.5">
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
                    <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--mp-ink)] text-emerald-400">
                      <ShieldCheck size={9} /> Verified
                    </span>
                  )}
                </div>
              </div>
              {product.shortDescription && (
                <p className="text-sm text-[var(--mp-muted)] leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
              {specEntries.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {specEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="bg-[var(--mp-wash)] rounded-xl px-3 py-2"
                    >
                      <p className="text-[9px] uppercase tracking-widest text-[var(--mp-muted)] font-bold">
                        {key}
                      </p>
                      <p className="text-xs font-semibold text-[var(--mp-ink-soft)] mt-0.5 truncate">
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
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--mp-wash)] text-[var(--mp-accent-ink)] border border-[var(--mp-line)]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[var(--mp-line)] flex gap-3">
          <button
            onClick={() => toggle(pid)}
            className={`p-3 rounded-xl border transition-all ${isWishlisted(pid) ? "bg-red-50 border-red-200 text-red-500" : "border-[var(--mp-tint)] text-[var(--mp-muted)] hover:text-red-400"}`}
          >
            <Heart
              size={16}
              fill={isWishlisted(pid) ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={() => navigate(`/product/${pid}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--mp-accent)] hover:bg-[var(--mp-accent-dark)] text-[var(--mp-ink)] font-bold text-sm py-3 rounded-xl transition-all duration-200"
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
    ...allSpecKeys.slice(0, 8).map((k) => ({
      label: k,
      render: (p) => (p.specs?.[k] ? String(p.specs[k]) : "—"),
    })),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[var(--mp-card)] w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--mp-line)]">
          <h2 className="font-bold text-[var(--mp-ink)]">Compare devices</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--mp-wash)] text-[var(--mp-muted)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <td className="p-4 w-32 text-xs font-bold uppercase tracking-widest text-[var(--mp-muted)] sticky left-0 bg-[var(--mp-card)] z-10">
                  Spec
                </td>
                {items.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <td key={pid} className="p-3 text-center min-w-[180px]">
                      <div className="relative inline-block">
                        <button
                          onClick={() => onRemove(p)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--mp-wash2)] hover:bg-red-100 text-[var(--mp-muted)] hover:text-red-500 flex items-center justify-center transition-colors z-10"
                        >
                          <X size={10} />
                        </button>
                        <img
                          src={p.images?.[0] || FALLBACK_IMG}
                          alt={p.name}
                          className="w-28 h-28 object-contain bg-white rounded-xl mx-auto border border-[var(--mp-line)]"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMG;
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--mp-muted)] mt-2">
                        {p.brand}
                      </p>
                      <p className="text-sm font-semibold text-[var(--mp-ink)] leading-tight mt-0.5">
                        {p.name}
                      </p>
                      <button
                        onClick={() => navigate(`/product/${pid}`)}
                        className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--mp-accent)] text-[var(--mp-ink)] hover:bg-[var(--mp-accent-dark)] transition-all"
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
                  className={
                    idx % 2 === 0 ? "bg-[var(--mp-wash)]" : "bg-[var(--mp-card)]"
                  }
                >
                  <td className="px-4 py-3 text-xs font-semibold text-[var(--mp-muted)] capitalize sticky left-0 bg-inherit z-10">
                    {row.label}
                  </td>
                  {items.map((p) => (
                    <td
                      key={p._id || p.id}
                      className="px-4 py-3 text-sm text-center font-mono text-[var(--mp-ink-soft)]"
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
      <div className="bg-[var(--mp-ink)] text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 pointer-events-auto border border-white/15">
        <div className="flex items-center gap-2">
          {items.map((p) => (
            <div key={p._id || p.id} className="relative">
              <img
                src={p.images?.[0] || FALLBACK_IMG}
                alt={p.name}
                className="w-9 h-9 rounded-lg object-contain bg-white border-2 border-white/20"
                onError={(e) => {
                  e.target.src = FALLBACK_IMG;
                }}
              />
              <button
                onClick={() => onRemove(p)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/25 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
              >
                <X size={8} />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white/50 text-xs"
            >
              +
            </div>
          ))}
        </div>
        <div className="h-6 w-px bg-white/20" />
        <p className="text-sm text-[var(--mp-wash2)]">
          {items.length} selected
        </p>
        <button
          onClick={onOpen}
          disabled={items.length < 2}
          className="bg-[var(--mp-accent)] hover:bg-[var(--mp-tint)] text-[var(--mp-ink)] font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Compare {items.length >= 2 ? "→" : `(need ${2 - items.length} more)`}
        </button>
        <button
          onClick={onClear}
          className="text-white/60 hover:text-white transition-colors"
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
  const [, startTransition] = useTransition();

  const tab = searchParams.get("tab") || "all";
  const brand = searchParams.get("brand") || "All";
  const condition = searchParams.get("condition") || "All";
  const minPrice = num(searchParams.get("minPrice"));
  const maxPrice = num(searchParams.get("maxPrice"));
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
  const setSortIdx = (v) => setParam("sort", v, 0);
  const setSearch = (v) => setParam("q", v, "");

  // one URL update for both ends of the budget
  const setBudget = (min, max) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("minPrice");
        next.delete("maxPrice");
        if (min !== null && min !== undefined) next.set("minPrice", String(min));
        if (max !== null && max !== undefined) next.set("maxPrice", String(max));
        return next;
      },
      { replace: true },
    );
  };

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
  const deferredSearch = useDeferredValue(search);

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

      const categoryParam =
        tab === "phones" ? "phone" : tab === "laptops" ? "laptop" : undefined;

      const params = {
        limit: 24,
        sortBy: sort.sortBy,
        order: sort.order,
        ...(categoryParam && { category: categoryParam }),
        ...(brand !== "All" && { brand }),
        ...(condition !== "All" && { condition }),
        ...(minPrice !== null && { minPrice }),
        ...(maxPrice !== null && { maxPrice }),
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
    [tab, brand, condition, minPrice, maxPrice, sortIdx, deferredSearch],
  );

  useEffect(() => {
    fetchListings(null);
  }, [fetchListings]);

  // Infinite load. Works for both the vertical grid (desktop) and the
  // sideways-swipe grid (mobile): every [data-sentinel] that is visible loads more.
  useEffect(() => {
    if (!hasNext) return;
    const els = document.querySelectorAll("[data-sentinel]");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some((e) => e.isIntersecting) &&
          !loadingMore &&
          nextCursor
        )
          fetchListings(nextCursor);
      },
      { rootMargin: "200px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hasNext, loadingMore, nextCursor, fetchListings, allListings.length]);

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

  const hasBudget = minPrice !== null || maxPrice !== null;
  const activeFilters =
    (brand !== "All" ? 1 : 0) +
    (condition !== "All" ? 1 : 0) +
    (hasBudget ? 1 : 0) +
    (sortIdx !== 0 ? 1 : 0);
  const clearFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ["brand", "condition", "minPrice", "maxPrice", "sort"].forEach((k) =>
          next.delete(k),
        );
        return next;
      },
      { replace: true },
    );
  };

  // Showcase sections (hero / deals / trending) only when nothing is filtered —
  // someone who picked a budget goes straight to results.
  const showcase = !search.trim() && activeFilters === 0;

  const pill =
    "px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap";
  const pillOn =
    "bg-[var(--mp-accent)] text-[var(--mp-ink)] border-[var(--mp-accent)]";
  const pillOff =
    "bg-[var(--mp-card)] text-[var(--mp-muted)] border-[var(--mp-tint)] hover:border-[var(--mp-accent)] hover:text-[var(--mp-accent-ink)]";

  const displayedListings = useMemo(() => {
    if (tab === "phones") return phones;
    if (tab === "laptops") return laptops;
    return allListings;
  }, [tab, phones, laptops, allListings]);

  const trendTabCls = (active) =>
    `text-xs font-bold px-3 py-1 rounded-full transition-all ${
      active
        ? "bg-[var(--mp-accent)] text-[var(--mp-ink)]"
        : "text-[var(--mp-muted)] hover:text-[var(--mp-accent-ink)]"
    }`;

  const budgetLabel = hasBudget
    ? `KES ${minPrice !== null ? minPrice.toLocaleString() : "0"}${
        maxPrice !== null ? ` – ${maxPrice.toLocaleString()}` : "+"
      }`
    : null;

  return (
    <div
      className="mp-root min-h-screen bg-[var(--mp-bg)]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── NAV ────────────────────────────────────────────── */}
      <nav className="bg-[var(--mp-bg)] border-b border-[var(--mp-tint)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 max-w-xl relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search phones, laptops, brands…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--mp-card)] border border-[var(--mp-tint)] rounded-xl pl-9 pr-9 py-2.5 text-sm placeholder:text-[var(--mp-muted)] outline-none focus:border-[var(--mp-accent)] transition-colors text-[var(--mp-ink)]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-muted)] hover:text-[var(--mp-ink)]"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-[var(--mp-ink-soft)]">
            {[
              ["all", "All"],
              ["phones", "Phones"],
              ["laptops", "Laptops"],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTab(val)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${tab === val ? "text-[var(--mp-ink)] bg-[var(--mp-tint)]" : "hover:text-[var(--mp-accent-ink)] hover:bg-[var(--mp-wash)]"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {wishlist.count > 0 && (
              <div className="relative">
                <Heart size={20} className="text-[var(--mp-ink-soft)]" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {wishlist.count}
                </span>
              </div>
            )}
            {compare.count > 0 && (
              <div className="relative">
                <GitCompare size={20} className="text-[var(--mp-ink-soft)]" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--mp-ink)] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {compare.count}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile tabs (nav links are hidden below md) */}
        <div className="md:hidden mp-noscroll flex gap-2 overflow-x-auto px-4 pb-3">
          {[
            ["all", "All"],
            ["phones", "Phones"],
            ["laptops", "Laptops"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className={`${pill} ${tab === val ? pillOn : pillOff}`}
            >
              {label}
            </button>
          ))}
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
            <div className="bg-[var(--mp-card)] rounded-xl overflow-hidden border border-[var(--mp-line)] mb-4">
              <div className="bg-[var(--mp-ink)] text-white px-4 py-3 flex items-center gap-2">
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
                const on =
                  (cat.key === "phone" && tab === "phones") ||
                  (cat.key === "laptop" && tab === "laptops") ||
                  (cat.key === "all" && tab === "all");
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
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-b border-[var(--mp-line)] last:border-0 group ${
                      on
                        ? "bg-[var(--mp-tint)] text-[var(--mp-ink)] font-bold"
                        : "text-[var(--mp-ink-soft)] hover:bg-[var(--mp-wash)] hover:text-[var(--mp-accent-ink)] font-medium"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} />
                      {cat.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[var(--mp-muted)]">
                      {count > 0 && <span>{count}</span>}
                      <ChevronRight size={11} />
                    </span>
                  </button>
                );
              })}
            </div>

            {latestProducts.length > 0 && (
              <div className="bg-[var(--mp-card)] rounded-xl border border-[var(--mp-line)] overflow-hidden mb-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--mp-line)]">
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--mp-ink)]">
                    Latest Products
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--mp-accent)]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--mp-wash2)]" />
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-3">
                  {latestProducts.map((p) => (
                    <SidebarProduct key={p._id || p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[var(--mp-card)] rounded-xl border border-[var(--mp-line)] overflow-hidden">
              {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 px-4 py-3 border-b border-[var(--mp-line)] last:border-0"
                >
                  <Icon
                    size={20}
                    className="text-[var(--mp-accent-ink)] flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold text-[var(--mp-ink-soft)]">
                      {title}
                    </p>
                    <p className="text-[10px] text-[var(--mp-muted)] mt-0.5 leading-relaxed">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── MAIN CONTENT ─────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Budget — always on top */}
            <BudgetBar min={minPrice} max={maxPrice} onChange={setBudget} />

            {showcase && <HeroSlider onTabChange={(t) => setTab(t)} />}

            {/* Daily deals — swipe row on mobile, 2-up on desktop */}
            {showcase && deals.length > 0 && !loading && (
              <div>
                <div className="flex items-center mb-3">
                  <span className="bg-[var(--mp-ink)] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    Daily Deals
                  </span>
                </div>
                <div className="mp-noscroll flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 md:grid md:grid-cols-2 md:overflow-visible">
                  {deals.slice(0, 2).map((p) => (
                    <div
                      key={p._id || p.id}
                      className="snap-start flex-shrink-0 w-[82%] sm:w-[60%] md:w-auto"
                    >
                      <DailyDealCard product={p} onQuickView={setQuickViewProduct} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending — 2 rows, swipe sideways on mobile */}
            {showcase && trending.length > 0 && !loading && (
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="bg-[var(--mp-ink)] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                    Trending
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTab("all")}
                      className={trendTabCls(tab === "all")}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTab("phones")}
                      className={trendTabCls(tab === "phones")}
                    >
                      Phones
                    </button>
                    <button
                      onClick={() => setTab("laptops")}
                      className={trendTabCls(tab === "laptops")}
                    >
                      Laptops
                    </button>
                  </div>
                </div>
                <div className="mp-swipe mp-noscroll grid gap-3 md:grid-cols-4">
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

            {/* ── ALL LISTINGS ───────────────────────────── */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap bg-[var(--mp-card)] border border-[var(--mp-line)] rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Package size={14} className="text-[var(--mp-muted)]" />
                  <span className="text-sm font-bold text-[var(--mp-ink)]">
                    {search.trim()
                      ? `Results for "${search}"`
                      : tab === "phones"
                        ? "All Phones"
                        : tab === "laptops"
                          ? "All Laptops"
                          : "All Listings"}
                  </span>
                  {budgetLabel && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--mp-accent)] text-[var(--mp-ink)]">
                      {budgetLabel}
                    </span>
                  )}
                  {!loading && (
                    <span className="text-xs text-[var(--mp-muted)]">
                      ({displayedListings.length})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${showFilters || activeFilters > 0 ? "bg-[var(--mp-accent)] text-[var(--mp-ink)] border-[var(--mp-accent)]" : "border-[var(--mp-tint)] text-[var(--mp-ink-soft)] hover:border-[var(--mp-accent)]"}`}
                  >
                    <SlidersHorizontal size={12} />
                    Filters
                    {activeFilters > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[var(--mp-ink)] text-white text-[10px] font-black flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                  </button>
                  <div className="relative">
                    <select
                      value={sortIdx}
                      onChange={(e) => setSortIdx(Number(e.target.value))}
                      className="appearance-none bg-[var(--mp-card)] border border-[var(--mp-tint)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--mp-ink-soft)] pr-7 outline-none hover:border-[var(--mp-accent)] transition-colors cursor-pointer"
                    >
                      {SORT_OPTIONS.map((o, i) => (
                        <option key={i} value={i}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ArrowUpDown
                      size={10}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--mp-muted)] pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Filter panel (price now lives in the Budget bar above) */}
              {showFilters && (
                <div className="bg-[var(--mp-card)] border border-[var(--mp-line)] rounded-xl p-4 mb-4 flex flex-col gap-4">
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--mp-muted)] mb-2">
                        {title}
                      </p>
                      <div className="mp-noscroll flex gap-1.5 overflow-x-auto md:flex-wrap md:overflow-visible">
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
                  {activeFilters > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs text-[var(--mp-muted)] hover:text-[var(--mp-ink)] transition-colors w-fit font-medium"
                    >
                      <X size={12} /> Clear all
                    </button>
                  )}
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div className="mp-swipe mp-noscroll grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : displayedListings.length === 0 ? (
                <div className="bg-[var(--mp-card)] border border-[var(--mp-line)] rounded-2xl px-6 py-16 text-center">
                  <Package
                    size={32}
                    className="text-[var(--mp-tint)] mx-auto mb-3"
                  />
                  <p className="font-bold text-[var(--mp-ink)] text-lg mb-1">
                    No listings found
                  </p>
                  <p className="text-[var(--mp-muted)] text-sm">
                    Try a wider budget or fewer filters.
                  </p>
                  {activeFilters > 0 && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm font-bold text-[var(--mp-accent-ink)] hover:text-[var(--mp-ink)] transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mp-swipe mp-noscroll grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {displayedListings.map((p) => (
                      <ProductCard
                        key={p._id || p.id}
                        product={p}
                        onQuickView={setQuickViewProduct}
                        wishlist={wishlist}
                        compare={compare}
                      />
                    ))}
                    {loadingMore &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={`sk-${i}`} />
                      ))}
                    {/* mobile sentinel: sits at the end of the swipe row */}
                    <div
                      data-sentinel
                      className="md:hidden w-1"
                      style={{ gridRow: "span 2" }}
                    />
                  </div>
                  {/* desktop sentinel */}
                  <div data-sentinel className="hidden md:block h-4" />
                  {!hasNext && displayedListings.length > 0 && (
                    <p className="text-center text-xs text-[var(--mp-muted)] py-6 font-medium">
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

      <style>{`
        .mp-root {
          --mp-bg: #f7e6d9;
          --mp-tint: #f0c09b;
          --mp-accent: #e89454;
          --mp-accent-dark: #d4793a;
          --mp-accent-ink: #a8531a;
          --mp-ink: #050505;
          --mp-ink-soft: #2b1d14;
          --mp-muted: #7a5a46;
          --mp-card: #fffaf6;
          --mp-line: #f3d2ba;
          --mp-wash: #fbeee3;
          --mp-wash2: #f7dcc5;
        }
        .mp-noscroll { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .mp-noscroll::-webkit-scrollbar { display: none; }

        /* Small screens: devices go in 2 rows and swipe left/right —
           2 devices visible per row, never one long vertical list. */
        @media (max-width: 767px) {
          .mp-swipe {
            grid-template-rows: repeat(2, auto);
            grid-auto-flow: column;
            grid-auto-columns: calc(50% - 6px);
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 6px;
          }
          .mp-swipe > * { scroll-snap-align: start; }
        }
      `}</style>
    </div>
  );
}