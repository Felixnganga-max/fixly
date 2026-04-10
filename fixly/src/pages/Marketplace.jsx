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
  SlidersHorizontal,
  X,
  Heart,
  GitCompare,
  Bell,
  ArrowUpDown,
  Eye,
  Grid3X3,
  List,
  Zap,
  TrendingUp,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllListings, getBrandNames } from "../Hooks/marketplaceApi";
import { useWishlist } from "../Hooks/useWishlist";
import { useCompare } from "../Hooks/useCompare";
import { useRecentlyViewed } from "../Hooks/useRecentlyViewed";
// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const CONDITIONS = ["All", "New", "Used", "Refurbished"];
const PRICE_RANGES = [
  { label: "All prices", min: null, max: null },
  { label: "Under 50K", min: null, max: 50000 },
  { label: "50K – 100K", min: 50000, max: 100000 },
  { label: "100K – 200K", min: 100000, max: 200000 },
  { label: "200K+", min: 200000, max: null },
];
const SORT_OPTIONS = [
  { label: "Newest", sortBy: "createdAt", order: "desc", icon: Clock },
  { label: "Oldest", sortBy: "createdAt", order: "asc", icon: Clock },
  { label: "Price ↑", sortBy: "price", order: "asc", icon: ArrowUp },
  { label: "Price ↓", sortBy: "price", order: "desc", icon: ArrowDown },
  { label: "Most viewed", sortBy: "views", order: "desc", icon: Eye },
  { label: "Top rated", sortBy: "rating", order: "desc", icon: Star },
  { label: "Discount", sortBy: "oldPrice", order: "desc", icon: Zap },
];
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";

// ─────────────────────────────────────────────────────────────
// CONDITION STYLES
// ─────────────────────────────────────────────────────────────
const CONDITION_STYLE = {
  New: "bg-emerald-50  text-emerald-700 border-emerald-200",
  Used: "bg-amber-50    text-amber-700   border-amber-200",
  Refurbished: "bg-sky-50      text-sky-700     border-sky-200",
};

// ─────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-stone-100" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-2.5 bg-stone-100 rounded-full w-1/4" />
        <div className="h-4 bg-stone-100 rounded-full w-3/4" />
        <div className="h-3 bg-stone-100 rounded-full w-1/2" />
        <div className="h-5 bg-stone-100 rounded-full w-2/5" />
        <div className="h-9 bg-stone-100 rounded-xl mt-1" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  onQuickView,
  wishlist,
  compare,
  layout = "grid",
}) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const { isWishlisted, toggle: toggleWishlist } = wishlist;
  const { isComparing, toggle: toggleCompare, count: compareCount } = compare;
  const wishlisted = isWishlisted(pid);
  const comparing = isComparing(pid);

  if (layout === "list") {
    return (
      <div className="group bg-white border border-stone-100 hover:border-stone-300 rounded-2xl overflow-hidden flex gap-0 transition-all duration-200 hover:shadow-md">
        <div className="relative w-36 sm:w-48 flex-shrink-0 bg-stone-50 overflow-hidden">
          <img
            src={product.images?.[0] || product.image || FALLBACK_IMG}
            alt={product.name}
            draggable={false}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
            style={{ minHeight: 130 }}
            onError={(e) => {
              e.target.src = FALLBACK_IMG;
            }}
          />
          {product.discount && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
              -{product.discount}%
            </span>
          )}
        </div>
        <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  {product.brand}
                </p>
                <h3 className="font-semibold text-stone-900 text-sm leading-tight truncate">
                  {product.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {product.verified && (
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-emerald-400">
                    <ShieldCheck size={9} strokeWidth={2.5} /> Verified
                  </span>
                )}
              </div>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${CONDITION_STYLE[product.condition]}`}
            >
              {product.condition}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
            <div>
              <p className="font-mono font-extrabold text-base text-stone-900">
                KES {product.price.toLocaleString()}
              </p>
              {product.oldPrice && (
                <p className="font-mono text-xs text-stone-400 line-through">
                  KES {product.oldPrice.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(pid);
                }}
                className={`p-1.5 rounded-full border transition-all ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-stone-200 text-stone-400 hover:text-red-400"}`}
              >
                <Heart size={13} fill={wishlisted ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => onQuickView(product)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 transition-all"
              >
                Quick view
              </button>
              <button
                onClick={() => navigate(`/product/${pid}`)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-emerald-500 text-white transition-all duration-200"
              >
                View →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-stone-100 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full relative">
      {/* Image */}
      <div className="relative w-full h-48 bg-stone-50 overflow-hidden flex-shrink-0">
        <img
          src={product.images?.[0] || product.image || FALLBACK_IMG}
          alt={product.name}
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />

        {/* Badges */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONDITION_STYLE[product.condition]}`}
        >
          {product.condition}
        </span>
        {product.verified && (
          <span className="absolute top-3 right-3 flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-emerald-400">
            <ShieldCheck size={9} strokeWidth={2.5} /> Verified
          </span>
        )}
        {product.discount && (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            -{product.discount}%
          </span>
        )}

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md hover:bg-emerald-400 transition-all translate-y-2 group-hover:translate-y-0 duration-200"
          >
            Quick view
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
          {product.brand}
        </p>
        <h3 className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={10}
                className={
                  i <= Math.round(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-stone-200 fill-stone-200"
                }
              />
            ))}
            <span className="text-stone-400 text-[10px] ml-0.5">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-auto">
          <p className="font-mono font-extrabold text-base text-stone-900">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="font-mono text-xs text-stone-400 line-through">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(pid);
            }}
            className={`p-2 rounded-xl border transition-all flex-shrink-0 ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-stone-200 text-stone-400 hover:text-red-400 hover:border-red-200"}`}
          >
            <Heart size={13} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product);
            }}
            disabled={!comparing && compareCount >= 4}
            className={`p-2 rounded-xl border transition-all flex-shrink-0 ${comparing ? "bg-violet-50 border-violet-300 text-violet-600" : "border-stone-200 text-stone-400 hover:text-violet-500 hover:border-violet-200"} disabled:opacity-30`}
          >
            <GitCompare size={13} />
          </button>
          <button
            onClick={() => navigate(`/product/${pid}`)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-emerald-500 text-white hover:text-stone-900 font-semibold text-xs py-2 rounded-xl transition-all duration-200"
          >
            View Details <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FEATURED CARD (horizontal scroll strip)
// ─────────────────────────────────────────────────────────────
function FeaturedCard({ product, wishlist }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const { isWishlisted, toggle } = wishlist;

  return (
    <div
      onClick={() => navigate(`/product/${pid}`)}
      className="group relative flex-shrink-0 w-52 sm:w-60 rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white select-none cursor-pointer"
    >
      <div className="w-full h-40 overflow-hidden bg-stone-50 relative">
        <img
          src={product.images?.[0] || product.image || FALLBACK_IMG}
          alt={product.name}
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
        />
        {product.verified && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-emerald-400">
            <ShieldCheck size={9} strokeWidth={2.5} /> Verified
          </div>
        )}
        {product.discount && (
          <div className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            -{product.discount}%
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(pid);
          }}
          className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all ${isWishlisted(pid) ? "bg-red-500 text-white" : "bg-white/90 text-stone-400 hover:text-red-500"}`}
        >
          <Heart size={12} fill={isWishlisted(pid) ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
          {product.brand}
        </p>
        <h3 className="font-semibold text-stone-900 text-sm mt-0.5 leading-tight line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-2">
          <p className="font-mono font-extrabold text-sm text-stone-900">
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="font-mono text-[10px] text-stone-400 line-through">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUICK VIEW MODAL
// ─────────────────────────────────────────────────────────────
function QuickViewModal({ product, onClose, wishlist }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const { isWishlisted, toggle } = wishlist;
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.images?.length ? product.images : [FALLBACK_IMG];

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const specEntries = product.specs
    ? Object.entries(product.specs).slice(0, 6)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {product.brand}
            </p>
            <h2 className="font-semibold text-stone-900 text-base leading-tight">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row">
            {/* Image carousel */}
            <div className="sm:w-64 flex-shrink-0 bg-stone-50">
              <div className="relative w-full h-56 sm:h-64 overflow-hidden">
                <img
                  src={images[imgIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-200"
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow text-stone-700 hover:bg-white transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow text-stone-700 hover:bg-white transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`h-1 rounded-full transition-all ${i === imgIdx ? "w-4 bg-stone-900" : "w-1 bg-stone-400"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-1.5 p-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? "border-stone-900" : "border-transparent"}`}
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

            {/* Details */}
            <div className="flex-1 p-5 flex flex-col gap-4">
              {/* Price + badges */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="font-mono font-extrabold text-xl text-stone-900">
                      KES {product.price.toLocaleString()}
                    </p>
                    {product.oldPrice && (
                      <p className="font-mono text-sm text-stone-400 line-through">
                        KES {product.oldPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {product.discount && (
                    <p className="text-xs text-red-500 font-semibold mt-0.5">
                      You save {product.discount}%
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONDITION_STYLE[product.condition]}`}
                  >
                    {product.condition}
                  </span>
                  {product.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-900 text-emerald-400">
                      <ShieldCheck size={9} /> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className="text-sm text-stone-500 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Specs grid */}
              {specEntries.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  {specEntries.map(([key, val]) => (
                    <div key={key} className="bg-stone-50 rounded-xl px-3 py-2">
                      <p className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold">
                        {key}
                      </p>
                      <p className="text-xs font-semibold text-stone-800 mt-0.5 truncate">
                        {String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Features */}
              {product.features?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.features.slice(0, 5).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-1 rounded-full bg-stone-100 text-stone-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i <= Math.round(product.rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-stone-200 fill-stone-200"
                      }
                    />
                  ))}
                  <span className="text-xs text-stone-400">
                    {product.rating.toFixed(1)} · {product.reviews} reviews
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-stone-100 flex gap-3">
          <button
            onClick={() => toggle(pid)}
            className={`p-3 rounded-xl border transition-all ${isWishlisted(pid) ? "bg-red-50 border-red-200 text-red-500" : "border-stone-200 text-stone-400 hover:text-red-400"}`}
          >
            <Heart
              size={16}
              fill={isWishlisted(pid) ? "currentColor" : "none"}
            />
          </button>
          <button
            onClick={() => navigate(`/product/${pid}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-stone-900 hover:bg-emerald-500 text-white hover:text-stone-900 font-semibold text-sm py-3 rounded-xl transition-all duration-200"
          >
            View Full Page <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPARE MODAL
// ─────────────────────────────────────────────────────────────
function CompareModal({ items, onClose, onRemove }) {
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

  const navigate = useNavigate();

  // Collect all spec keys across all items
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
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-4xl sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl z-10 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">Compare devices</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <td className="p-4 w-32 text-xs font-semibold uppercase tracking-widest text-stone-400 sticky left-0 bg-white z-10">
                  Spec
                </td>
                {items.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <td key={pid} className="p-3 text-center min-w-[180px]">
                      <div className="relative inline-block">
                        <button
                          onClick={() => onRemove(p)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-stone-200 hover:bg-red-100 text-stone-500 hover:text-red-500 flex items-center justify-center transition-colors text-xs z-10"
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
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mt-2">
                        {p.brand}
                      </p>
                      <p className="text-sm font-semibold text-stone-900 leading-tight mt-0.5">
                        {p.name}
                      </p>
                      <button
                        onClick={() => navigate(`/product/${pid}`)}
                        className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-emerald-500 hover:text-stone-900 transition-all"
                      >
                        View →
                      </button>
                    </td>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, idx) => {
                // Highlight best value for price (lowest) and rating (highest)
                const values = items.map((p) => row.render(p));
                return (
                  <tr
                    key={row.label}
                    className={idx % 2 === 0 ? "bg-stone-50" : "bg-white"}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-stone-500 capitalize sticky left-0 bg-inherit z-10">
                      {row.label}
                    </td>
                    {items.map((p) => (
                      <td
                        key={p._id || p.id}
                        className="px-4 py-3 text-sm text-center font-mono text-stone-800"
                      >
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPARE BAR (sticky bottom)
// ─────────────────────────────────────────────────────────────
function CompareBar({ items, onOpen, onRemove, onClear }) {
  if (items.length < 1) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-4 pointer-events-none">
      <div className="bg-stone-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 pointer-events-auto border border-stone-700">
        <div className="flex items-center gap-2">
          {items.map((p) => (
            <div key={p._id || p.id} className="relative">
              <img
                src={p.images?.[0] || FALLBACK_IMG}
                alt={p.name}
                className="w-9 h-9 rounded-lg object-cover border-2 border-stone-600"
                onError={(e) => {
                  e.target.src = FALLBACK_IMG;
                }}
              />
              <button
                onClick={() => onRemove(p)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-stone-500 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
              >
                <X size={8} />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-lg border-2 border-dashed border-stone-600 flex items-center justify-center text-stone-500 text-xs"
            >
              +
            </div>
          ))}
        </div>
        <div className="h-6 w-px bg-stone-700" />
        <p className="text-sm text-stone-300">{items.length} selected</p>
        <button
          onClick={onOpen}
          disabled={items.length < 2}
          className="bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-semibold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Compare {items.length >= 2 ? "→" : `(need ${2 - items.length} more)`}
        </button>
        <button
          onClick={onClear}
          className="text-stone-400 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RECENTLY VIEWED STRIP
// ─────────────────────────────────────────────────────────────
function RecentlyViewedStrip({ ids, allListings }) {
  const navigate = useNavigate();
  const products = useMemo(
    () =>
      ids
        .map((id) => allListings.find((p) => (p._id || p.id) === id))
        .filter(Boolean),
    [ids, allListings],
  );
  if (!products.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-stone-400" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          Recently viewed
        </h3>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p) => {
          const pid = p._id || p.id;
          return (
            <button
              key={pid}
              onClick={() => navigate(`/product/${pid}`)}
              className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-stone-100 hover:border-stone-300 rounded-xl px-3 py-2 transition-all group"
            >
              <img
                src={p.images?.[0] || FALLBACK_IMG}
                alt={p.name}
                className="w-9 h-9 rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = FALLBACK_IMG;
                }}
              />
              <div className="text-left">
                <p className="text-[10px] text-stone-400">{p.brand}</p>
                <p className="text-xs font-semibold text-stone-800 leading-tight max-w-[100px] truncate">
                  {p.name}
                </p>
                <p className="text-[10px] font-mono text-stone-500">
                  KES {p.price.toLocaleString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN MARKETPLACE
// ─────────────────────────────────────────────────────────────
export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ── URL-synced filter state ───────────────────────────────
  const tab = searchParams.get("tab") || "phones";
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

  const setTab = (v) => startTransition(() => setParam("tab", v, "phones"));
  const setBrand = (v) => setParam("brand", v, "All");
  const setCondition = (v) => setParam("condition", v, "All");
  const setPriceRange = (v) => setParam("price", v, 0);
  const setSortIdx = (v) => setParam("sort", v, 0);
  const setSearch = (v) => setParam("q", v, "");

  // ── Local UI state ─────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [layout, setLayout] = useState("grid"); // "grid" | "list"
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  // ── Data state ─────────────────────────────────────────────
  const [allListings, setAllListings] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [brands, setBrands] = useState(["All"]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // ── Wishlist / Compare / Recently Viewed ───────────────────
  const wishlist = useWishlist();
  const compare = useCompare();
  const { ids: recentIds } = useRecentlyViewed();

  // ── Deferred search (don't filter on every keystroke) ──────
  const deferredSearch = useDeferredValue(search);

  // ── Fetch brands when tab changes ─────────────────────────
  useEffect(() => {
    const cat = tab === "phones" ? "phone" : "laptop";
    getBrandNames(cat)
      .then((names) => setBrands(["All", ...names]))
      .catch(() => setBrands(["All"]));
    setBrand("All"); // reset brand filter on tab switch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ── Fetch listings ─────────────────────────────────────────
  const fetchListings = useCallback(
    async (cursor = null) => {
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      setError("");

      const sort = SORT_OPTIONS[sortIdx] || SORT_OPTIONS[0];
      const range = PRICE_RANGES[priceRange];
      const cat = tab === "phones" ? "phone" : "laptop";

      const params = {
        category: cat,
        limit: 24,
        sortBy: sort.sortBy,
        order: sort.order,
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
          // Set featured: first 8 verified listings
          setFeatured(res.data.filter((l) => l.verified).slice(0, 8));
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

  // ── Load more (infinite scroll sentinel) ─────────────────
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasNext) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore && nextCursor) {
          fetchListings(nextCursor);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNext, loadingMore, nextCursor, fetchListings]);

  // ── Derived ───────────────────────────────────────────────
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

  // ── Pill styles ────────────────────────────────────────────
  const pill =
    "px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer whitespace-nowrap";
  const pillOn = "bg-stone-900 text-white border-stone-900";
  const pillOff =
    "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800";

  // ── Render grid/list ──────────────────────────────────────
  const renderProducts = (products) => {
    if (layout === "list") {
      return (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <ProductCard
              key={p._id || p.id}
              product={p}
              onQuickView={setQuickViewProduct}
              wishlist={wishlist}
              compare={compare}
              layout="list"
            />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard
            key={p._id || p.id}
            product={p}
            onQuickView={setQuickViewProduct}
            wishlist={wishlist}
            compare={compare}
            layout="grid"
          />
        ))}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">
        {/* ── HEADER ─────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-1">
                Fixly
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-none tracking-tight">
                Marketplace
              </h1>
              <p className="text-stone-500 text-sm mt-2">
                Verified phones & laptops, all in one place.
              </p>
            </div>
            {wishlist.count > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5 w-fit">
                <Heart size={14} className="text-red-500 fill-red-500" />
                <span className="text-xs font-semibold text-red-600">
                  {wishlist.count} saved
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search phones, laptops, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl pl-11 pr-11 py-3.5 text-sm placeholder:text-stone-400 outline-none focus:border-stone-400 transition-colors shadow-sm text-stone-900"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── FEATURED STRIP ──────────────────────────────── */}
        {!search.trim() && featured.length > 0 && !loading && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <h2 className="font-bold text-stone-900 text-lg">Featured</h2>
              </div>
              <span className="text-xs text-stone-400 hidden sm:block select-none">
                ← drag →
              </span>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", cursor: "grab" }}
            >
              {featured.map((p) => (
                <FeaturedCard
                  key={p._id || p.id}
                  product={p}
                  wishlist={wishlist}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── RECENTLY VIEWED ─────────────────────────────── */}
        {!search.trim() && recentIds.length > 0 && allListings.length > 0 && (
          <RecentlyViewedStrip ids={recentIds} allListings={allListings} />
        )}

        {/* ── CATEGORY + FILTERS ──────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Top bar: tabs + view toggle + sort + filter button */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category tabs */}
            <div className="flex gap-2 bg-white border border-stone-200 rounded-2xl p-1">
              {[
                ["phones", "Phones"],
                ["laptops", "Laptops"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTab(val)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${tab === val ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortIdx}
                  onChange={(e) => setSortIdx(Number(e.target.value))}
                  className="appearance-none bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-700 pr-7 outline-none hover:border-stone-400 transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map((o, i) => (
                    <option key={i} value={i}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  size={11}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
              </div>

              {/* Layout toggle */}
              <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setLayout("grid")}
                  className={`p-2.5 transition-colors ${layout === "grid" ? "bg-stone-900 text-white" : "text-stone-400 hover:text-stone-700"}`}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setLayout("list")}
                  className={`p-2.5 transition-colors ${layout === "list" ? "bg-stone-900 text-white" : "text-stone-400 hover:text-stone-700"}`}
                >
                  <List size={14} />
                </button>
              </div>

              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${showFilters || activeFilters > 0 ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"}`}
              >
                <SlidersHorizontal size={13} strokeWidth={2} />
                Filters
                {activeFilters > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-400 text-stone-900 text-[10px] font-bold flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-5">
              {[
                { title: "Brand", items: brands, active: brand, set: setBrand },
                {
                  title: "Condition",
                  items: CONDITIONS,
                  active: condition,
                  set: setCondition,
                },
              ].map(({ title, items, active, set }) => (
                <div key={title} className="flex flex-col gap-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                    {title}
                  </p>
                  <div className="flex gap-2 flex-wrap">
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

              <div className="flex flex-col gap-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Price range
                </p>
                <div className="flex gap-2 flex-wrap">
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
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-800 transition-colors w-fit"
                >
                  <X size={13} /> Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p className="text-stone-400 text-xs">
              {allListings.length} listing{allListings.length !== 1 ? "s" : ""}
              {activeFilters > 0 && " · filtered"}
              {isPending && " · updating…"}
            </p>
          )}

          {/* ── PRODUCT GRID ──────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : allListings.length === 0 ? (
            <div className="bg-white border border-stone-100 rounded-3xl px-6 py-20 text-center">
              <p className="font-bold text-stone-900 text-xl mb-2">
                No listings found
              </p>
              <p className="text-stone-400 text-sm">
                Try adjusting your filters or search term.
              </p>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {renderProducts(allListings)}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {/* Load more indicator */}
              {loadingMore && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!hasNext && allListings.length > 0 && (
                <p className="text-center text-xs text-stone-400 py-4">
                  All {allListings.length} listings loaded
                </p>
              )}
            </>
          )}
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

      {/* ── COMPARE BAR ────────────────────────────────────── */}
      <CompareBar
        items={compare.items}
        onOpen={() => setShowCompare(true)}
        onRemove={compare.toggle}
        onClear={compare.clear}
      />
    </div>
  );
}
