import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Loader2,
  Grid2X2,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  GitCompare,
  Eye,
  Truck,
  MapPin,
  CreditCard,
  Package,
  Zap,
  Clock,
  Users,
  TrendingUp,
  BadgeCheck,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { getListingById, getAllListings } from "../Hooks/marketplaceApi";
import BuyNowModal from "../components/BuyNow";
import { useWishlist } from "../Hooks/useWishlist";
import { useCompare } from "../Hooks/useCompare";
// ── Constants ──────────────────────────────────────────────────
const PHONE_SPEC_GROUPS = [
  {
    group: "Display",
    fields: [
      { key: "screenSize", label: "Screen Size", unit: '"' },
      { key: "resolution", label: "Resolution" },
      { key: "displayType", label: "Display Type" },
      { key: "refreshRate", label: "Refresh Rate", unit: "Hz" },
    ],
  },
  {
    group: "Performance",
    fields: [
      { key: "processor", label: "Processor" },
      { key: "ram", label: "RAM" },
      { key: "storage", label: "Storage" },
      { key: "os", label: "Operating System" },
    ],
  },
  {
    group: "Camera",
    fields: [
      { key: "mainCamera", label: "Main Camera" },
      { key: "frontCamera", label: "Front Camera" },
      { key: "cameraFeatures", label: "Features" },
    ],
  },
  {
    group: "Battery & Connectivity",
    fields: [
      { key: "battery", label: "Battery", unit: "mAh" },
      { key: "charging", label: "Charging" },
      { key: "connectivity", label: "Connectivity" },
      { key: "sim", label: "SIM" },
    ],
  },
];

const LAPTOP_SPEC_GROUPS = [
  {
    group: "Display",
    fields: [
      { key: "screenSize", label: "Screen Size", unit: '"' },
      { key: "resolution", label: "Resolution" },
      { key: "displayType", label: "Display Type" },
      { key: "refreshRate", label: "Refresh Rate", unit: "Hz" },
    ],
  },
  {
    group: "Performance",
    fields: [
      { key: "processor", label: "Processor" },
      { key: "ram", label: "RAM" },
      { key: "storage", label: "Storage" },
      { key: "gpu", label: "GPU" },
      { key: "os", label: "Operating System" },
    ],
  },
  {
    group: "Battery & Build",
    fields: [
      { key: "battery", label: "Battery", unit: "Wh" },
      { key: "weight", label: "Weight" },
      { key: "dimensions", label: "Dimensions" },
    ],
  },
  {
    group: "Connectivity",
    fields: [
      { key: "ports", label: "Ports" },
      { key: "connectivity", label: "Wireless" },
      { key: "webcam", label: "Webcam" },
    ],
  },
];

const CONDITION_STYLE = {
  New: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Used: "bg-amber-50 text-amber-700 border-amber-200",
  Refurbished: "bg-sky-50 text-sky-700 border-sky-200",
};

const FALLBACK =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80";

// ── Gallery Modal ──────────────────────────────────────────────
function GalleryModal({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setCurrent((i) => Math.min(images.length - 1, i + 1)),
    [images.length],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0 border-b border-stone-800">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-stone-400 hover:text-white text-sm font-medium transition-colors"
        >
          <X size={16} strokeWidth={2} />
          Close
        </button>
        <span className="text-stone-500 text-xs font-mono">
          {current + 1} / {images.length}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-14 sm:px-20 min-h-0">
        <button
          onClick={prev}
          disabled={current === 0}
          className="absolute left-3 sm:left-5 w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 border border-stone-700 flex items-center justify-center transition-colors disabled:opacity-20"
        >
          <ChevronLeft size={18} className="text-white" strokeWidth={2} />
        </button>
        <img
          src={images[current]}
          alt={`Photo ${current + 1}`}
          className="max-h-full max-w-full object-contain rounded-xl"
          onError={(e) => {
            e.target.src = FALLBACK;
          }}
        />
        <button
          onClick={next}
          disabled={current === images.length - 1}
          className="absolute right-3 sm:right-5 w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 border border-stone-700 flex items-center justify-center transition-colors disabled:opacity-20"
        >
          <ChevronRight size={18} className="text-white" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-shrink-0 px-4 py-4 overflow-x-auto border-t border-stone-800">
        <div className="flex gap-2 w-max mx-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-150 ${
                current === i
                  ? "border-emerald-500 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = FALLBACK;
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Image Hero ─────────────────────────────────────────────────
function ImageHero({ images, productName, condition, verified, discount }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);

  const open = (index = 0) => {
    setGalleryStart(index);
    setGalleryOpen(true);
  };

  const slots = [...images];
  while (slots.length < 5) slots.push(null);
  const [main, ...thumbs] = slots.slice(0, 5);

  return (
    <>
      {galleryOpen && (
        <GalleryModal
          images={images}
          startIndex={galleryStart}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {/* Desktop */}
      <div className="hidden md:block relative rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 gap-1" style={{ height: 500 }}>
          <div
            className="relative cursor-pointer overflow-hidden bg-stone-100 group"
            onClick={() => open(0)}
          >
            <img
              src={main || FALLBACK}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              onError={(e) => {
                e.target.src = FALLBACK;
              }}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount && (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-500 text-white shadow-sm">
                  {discount}% OFF
                </span>
              )}
              <span
                className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${CONDITION_STYLE[condition]}`}
              >
                {condition}
              </span>
            </div>
            {verified && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-stone-900 text-emerald-400">
                <ShieldCheck size={11} strokeWidth={2.5} /> Verified
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1">
            {thumbs.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden group ${img ? "cursor-pointer bg-stone-100" : "bg-stone-50"}`}
                onClick={() => img && open(i + 1)}
              >
                {img ? (
                  <img
                    src={img}
                    alt={`${productName} ${i + 2}`}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = FALLBACK;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100" />
                )}
                {i === 3 && images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      open(0);
                    }}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-[11px] font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
                  >
                    <Grid2X2 size={12} strokeWidth={2} />
                    Show all {images.length} photos
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => open(0)}
        >
          <img
            src={main || FALLBACK}
            alt={productName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = FALLBACK;
            }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {discount && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">
                {discount}% OFF
              </span>
            )}
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${CONDITION_STYLE[condition]}`}
            >
              {condition}
            </span>
          </div>
          {verified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full bg-stone-900 text-emerald-400">
              <ShieldCheck size={10} strokeWidth={2.5} /> Verified
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-stone-900/70 text-white text-[10px] font-mono px-2.5 py-1 rounded-full">
              1 / {images.length}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {images.slice(1).map((img, i) => (
              <button
                key={i}
                onClick={() => open(i + 1)}
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-stone-200 hover:border-stone-900 transition-colors"
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK;
                  }}
                />
              </button>
            ))}
            <button
              onClick={() => open(0)}
              className="w-20 h-20 rounded-xl flex-shrink-0 border-2 border-stone-200 bg-stone-50 hover:border-stone-900 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Grid2X2 size={15} className="text-stone-500" strokeWidth={2} />
              <span className="text-[9px] font-semibold text-stone-500 text-center leading-tight">
                All
                <br />
                photos
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Trust Badges ───────────────────────────────────────────────
function TrustBadges({ verified, condition }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {verified && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck size={11} strokeWidth={2.5} /> Fixly Verified
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
        <CreditCard size={11} strokeWidth={2} /> MPesa · Card
      </span>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
        <Package size={11} strokeWidth={2} /> 1-yr Warranty
      </span>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
        <RefreshCw size={11} strokeWidth={2} /> 7-day Returns
      </span>
    </div>
  );
}

// ── Seller Card ────────────────────────────────────────────────
function SellerCard({ listedBy }) {
  if (!listedBy?.shopName) return null;
  const initials = listedBy.shopName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-white border border-stone-100 hover:border-stone-300 rounded-2xl px-4 py-3.5 transition-all duration-200 cursor-pointer group">
      <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-emerald-400 font-semibold text-sm flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-900 leading-tight">
          {listedBy.shopName}
        </p>
        {listedBy.location && (
          <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
            <MapPin size={10} strokeWidth={2} />
            {listedBy.location}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <BadgeCheck size={10} strokeWidth={2.5} /> Top Seller
        </span>
        <ExternalLink
          size={13}
          className="text-stone-300 group-hover:text-stone-600 transition-colors"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

// ── Sticky Buy Card ────────────────────────────────────────────
function BuyCard({
  product,
  discount,
  isPhone,
  specs,
  onBuy,
  wishlist,
  compare,
}) {
  const pid = product._id || product.id;
  const { isWishlisted, toggle: toggleWishlist } = wishlist;
  const { isComparing, toggle: toggleCompare, count: compareCount } = compare;

  const stockPct = product.stockCount
    ? Math.min(
        100,
        Math.round(
          ((product.stockCount - (product.sold ?? 0)) / product.stockCount) *
            100,
        ),
      )
    : 73;

  return (
    <div className="sticky top-6 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Price Section */}
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-baseline gap-3">
          <span className="font-mono font-extrabold text-3xl text-stone-900">
            KES {product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="font-mono text-base text-stone-400 line-through">
              KES {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
        {discount && product.oldPrice && (
          <p className="text-emerald-600 text-xs font-semibold mt-1">
            You save KES {(product.oldPrice - product.price).toLocaleString()} (
            {discount}% off)
          </p>
        )}

        {/* Scarcity + social proof */}
        <div className="mt-4">
          {product.stockCount && (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-amber-600">
                  ⚡ Only{" "}
                  {Math.max(1, product.stockCount - (product.sold ?? 0))} units
                  left
                </span>
                <span className="text-[10px] text-stone-400">
                  {stockPct}% sold
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${stockPct}%` }}
                />
              </div>
            </>
          )}
          {product.views > 0 && (
            <p className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-2">
              <Users size={11} strokeWidth={2} />
              {product.views.toLocaleString()} people have viewed this
            </p>
          )}
        </div>
      </div>

      {/* Condition + Badges */}
      <div className="px-6 pt-4 pb-0 flex flex-wrap gap-2">
        <span
          className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${CONDITION_STYLE[product.condition]}`}
        >
          {product.condition}
        </span>
        {product.verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-stone-900 text-emerald-400">
            <ShieldCheck size={10} strokeWidth={2.5} /> Verified
          </span>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="p-6 flex flex-col gap-3">
        <button
          onClick={onBuy}
          className="w-full bg-stone-900 hover:bg-emerald-500 text-white hover:text-stone-900 font-semibold text-base py-3.5 rounded-xl border border-transparent hover:border-emerald-600 transition-all duration-200"
        >
          Buy Now
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => toggleWishlist(pid)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 ${
              isWishlisted(pid)
                ? "bg-red-50 border-red-200 text-red-500"
                : "border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
            }`}
          >
            <Heart
              size={14}
              fill={isWishlisted(pid) ? "currentColor" : "none"}
              strokeWidth={2}
            />
            {isWishlisted(pid) ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => toggleCompare(product)}
            disabled={!isComparing(pid) && compareCount >= 4}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 ${
              isComparing(pid)
                ? "bg-violet-50 border-violet-300 text-violet-600"
                : "border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
            } disabled:opacity-30`}
          >
            <GitCompare size={14} strokeWidth={2} />
            Compare
          </button>
        </div>
      </div>

      {/* Verified Trust Note */}
      {product.verified && (
        <div className="mx-6 mb-4 flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 leading-relaxed">
          <ShieldCheck
            size={13}
            className="flex-shrink-0 mt-0.5 text-emerald-500"
            strokeWidth={2}
          />
          Physically inspected, tested, and verified by Fixly. What you see is
          what you get.
        </div>
      )}

      {/* Delivery Options */}
      <div className="mx-6 mb-4 bg-stone-50 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center gap-2.5 text-xs text-stone-600">
          <Truck
            size={13}
            strokeWidth={2}
            className="text-stone-400 flex-shrink-0"
          />
          <span>
            <span className="font-semibold text-stone-900">
              Same-day delivery
            </span>{" "}
            in Nairobi CBD
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-stone-600">
          <MapPin
            size={13}
            strokeWidth={2}
            className="text-stone-400 flex-shrink-0"
          />
          <span>
            <span className="font-semibold text-stone-900">
              Pickup available
            </span>{" "}
            from seller location
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-stone-600">
          <Package
            size={13}
            strokeWidth={2}
            className="text-stone-400 flex-shrink-0"
          />
          <span>
            <span className="font-semibold text-stone-900">
              G4S countrywide
            </span>{" "}
            delivery available
          </span>
        </div>
      </div>

      {/* Quick Spec Summary */}
      <div className="border-t border-stone-100 divide-y divide-stone-100">
        {[
          { label: "Category", value: isPhone ? "Smartphone" : "Laptop" },
          { label: "Brand", value: product.brand },
          { label: "RAM", value: specs.ram || "—" },
          { label: "Storage", value: specs.storage || "—" },
          { label: "Warranty", value: "1 year" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-center px-6 py-2.5"
          >
            <span className="text-xs text-stone-400">{label}</span>
            <span className="text-xs font-semibold text-stone-900">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Contact seller */}
      <div className="p-6 pt-4">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 font-semibold text-sm transition-all duration-200">
          <MessageSquare size={14} strokeWidth={2} />
          Contact Seller
        </button>
      </div>
    </div>
  );
}

// ── Main ProductDetail ─────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const compare = useCompare();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("specs");
  const [copied, setCopied] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getListingById(id);
        if (cancelled) return;
        setProduct(data);

        const res = await getAllListings({
          category: data.category,
          brand: data.brand,
          limit: 5,
        });
        if (cancelled) return;
        setRelated(res.data.filter((p) => p._id !== id).slice(0, 4));
      } catch (err) {
        if (!cancelled) setError(err.message || "Product not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-stone-400" />
          <p className="text-sm text-stone-400">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center flex-col gap-4">
        <p className="text-stone-500 text-lg">
          {error || "Product not found."}
        </p>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-emerald-600 text-sm hover:underline"
        >
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  const isPhone = product.category === "phone";
  const specGroups = isPhone ? PHONE_SPEC_GROUPS : LAPTOP_SPEC_GROUPS;
  const images = product.images?.length ? product.images : [FALLBACK];
  const discount =
    product.discount ??
    (product.oldPrice
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : null);
  const specs = product.specs || {};
  const tabs = ["specs", "features", "overview"];

  return (
    <div className="min-h-screen bg-stone-50">
      {showBuyModal && (
        <BuyNowModal product={product} onClose={() => setShowBuyModal(false)} />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-stone-400 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-1 hover:text-stone-800 transition-colors font-medium"
          >
            <ArrowLeft size={12} strokeWidth={2} /> Marketplace
          </button>
          <span className="text-stone-300">/</span>
          <span>{isPhone ? "Phones" : "Laptops"}</span>
          <span className="text-stone-300">/</span>
          <span>{product.brand}</span>
          <span className="text-stone-300">/</span>
          <span className="text-stone-700 font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">
              {product.brand} · {isPhone ? "Smartphones" : "Laptops"}
            </p>
            <h1 className="font-bold text-2xl sm:text-3xl text-stone-900 leading-tight">
              {product.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-3 py-2 rounded-xl transition-all"
            >
              {copied ? (
                <Check size={13} strokeWidth={2} />
              ) : (
                <Copy size={13} strokeWidth={2} />
              )}
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>

        {/* Image Hero */}
        <ImageHero
          images={images}
          productName={product.name}
          condition={product.condition}
          verified={product.verified}
          discount={discount}
        />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 mt-10">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rating + Social Proof */}
            <div>
              {product.rating > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={15}
                        className={
                          i <= Math.round(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-stone-200 text-stone-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="font-mono font-semibold text-sm text-stone-900">
                    {product.rating.toFixed(1)}
                  </span>
                  {product.reviews > 0 && (
                    <span className="text-stone-400 text-sm">
                      ({product.reviews} reviews)
                    </span>
                  )}
                  {product.views > 0 && (
                    <span className="flex items-center gap-1 text-stone-400 text-xs ml-1">
                      <Eye size={12} strokeWidth={2} />
                      {product.views.toLocaleString()} views
                    </span>
                  )}
                </div>
              )}
              <TrustBadges
                verified={product.verified}
                condition={product.condition}
              />
            </div>

            <div className="border-t border-stone-100" />

            {/* Description */}
            <p className="text-stone-500 text-[15px] leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quick Specs Grid */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">
                Quick specs
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: "Condition", value: product.condition },
                  {
                    label: "Screen",
                    value: specs.screenSize ? `${specs.screenSize}"` : "—",
                  },
                  { label: "RAM", value: specs.ram || "—" },
                  { label: "Storage", value: specs.storage || "—" },
                  {
                    label: "Battery",
                    value: specs.battery
                      ? `${specs.battery} ${isPhone ? "mAh" : "Wh"}`
                      : "—",
                  },
                  { label: "OS", value: specs.os?.split(",")[0] || "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-white border border-stone-100 rounded-xl px-4 py-3 hover:border-stone-300 transition-colors"
                  >
                    <p className="text-stone-400 text-[10px] mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-stone-900 leading-tight">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-100" />

            {/* Seller */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-3">
                Listed by
              </p>
              <SellerCard listedBy={product.listedBy} />
            </div>

            <div className="border-t border-stone-100" />

            {/* Tabs */}
            <div>
              <div className="flex gap-1 bg-white border border-stone-200 rounded-2xl p-1 w-fit mb-6">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                      activeTab === t
                        ? "bg-stone-900 text-white shadow-sm"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {t === "specs"
                      ? "Specifications"
                      : t === "features"
                        ? "Key Features"
                        : "Overview"}
                  </button>
                ))}
              </div>

              {/* Specs Tab */}
              {activeTab === "specs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {specGroups.map(({ group, fields }) => {
                    const hasAny = fields.some((f) => specs[f.key]);
                    if (!hasAny) return null;
                    return (
                      <div
                        key={group}
                        className="bg-white border border-stone-100 rounded-2xl overflow-hidden"
                      >
                        <div className="bg-stone-50 border-b border-stone-100 px-5 py-3">
                          <h3 className="font-semibold text-xs uppercase tracking-widest text-stone-500">
                            {group}
                          </h3>
                        </div>
                        <div className="divide-y divide-stone-100">
                          {fields.map(({ key, label, unit }) => {
                            if (!specs[key]) return null;
                            return (
                              <div key={key} className="flex gap-4 px-5 py-3">
                                <span className="text-stone-400 text-sm w-32 flex-shrink-0">
                                  {label}
                                </span>
                                <span className="text-sm font-medium text-stone-900 leading-relaxed">
                                  {specs[key]}
                                  {unit && !String(specs[key]).includes(unit)
                                    ? ` ${unit}`
                                    : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {specGroups.every(
                    ({ fields }) => !fields.some((f) => specs[f.key]),
                  ) && (
                    <p className="text-stone-400 text-sm col-span-2">
                      No specifications listed yet.
                    </p>
                  )}
                </div>
              )}

              {/* Features Tab */}
              {activeTab === "features" && (
                <div className="bg-white border border-stone-100 rounded-2xl p-6">
                  {product.features?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2
                            size={15}
                            className="text-emerald-500 flex-shrink-0 mt-0.5"
                            strokeWidth={2}
                          />
                          <span className="text-stone-600 text-sm leading-relaxed">
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 text-sm">
                      No features listed yet.
                    </p>
                  )}
                </div>
              )}

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="bg-white border border-stone-100 rounded-2xl p-6 space-y-6">
                  <p className="text-stone-500 text-[15px] leading-relaxed">
                    {product.shortDescription}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Brand", value: product.brand },
                      { label: "Condition", value: product.condition },
                      {
                        label: "Verified",
                        value: product.verified
                          ? "Yes — by Fixly"
                          : "Not verified",
                      },
                      {
                        label: "Rating",
                        value:
                          product.rating > 0
                            ? `${product.rating}/5 (${product.reviews} reviews)`
                            : "Not rated",
                      },
                      {
                        label: "Price",
                        value: `KES ${product.price.toLocaleString()}`,
                      },
                      {
                        label: "Type",
                        value: isPhone ? "Smartphone" : "Laptop",
                      },
                      {
                        label: "Views",
                        value: product.views?.toLocaleString() ?? "—",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100"
                      >
                        <p className="text-stone-400 text-[10px] mb-1 uppercase tracking-wide font-semibold">
                          {label}
                        </p>
                        <p className="font-semibold text-sm text-stone-900">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Sticky Buy Card */}
          <div className="lg:col-span-1">
            <BuyCard
              product={product}
              discount={discount}
              isPhone={isPhone}
              specs={specs}
              onBuy={() => setShowBuyModal(true)}
              wishlist={wishlist}
              compare={compare}
            />
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp
                size={16}
                className="text-stone-400"
                strokeWidth={2}
              />
              <h2 className="font-bold text-xl text-stone-900">
                More from {product.brand}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="group bg-white border border-stone-100 rounded-2xl overflow-hidden cursor-pointer hover:border-stone-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-full h-40 bg-stone-50 overflow-hidden">
                    <img
                      src={p.images?.[0] || ""}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = FALLBACK;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-stone-400 text-[10px] uppercase tracking-widest font-semibold">
                      {p.brand}
                    </p>
                    <h3 className="font-semibold text-sm mt-0.5 leading-tight line-clamp-2 text-stone-900">
                      {p.name}
                    </h3>
                    {p.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i <= Math.round(p.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-stone-200 text-stone-200"
                            }
                          />
                        ))}
                        <span className="text-[10px] text-stone-400 ml-0.5">
                          {p.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="font-mono font-extrabold text-sm text-stone-900">
                        KES {p.price.toLocaleString()}
                      </p>
                      {p.oldPrice && (
                        <p className="font-mono text-[10px] text-stone-400 line-through">
                          KES {p.oldPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
