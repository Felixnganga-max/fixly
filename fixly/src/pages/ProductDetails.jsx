import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { getListingById, getAllListings } from "../Hooks/marketplaceApi";
import BuyNowModal from "../components/BuyNow";

// ── Spec groups ────────────────────────────────────────────────
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

const conditionStyle = {
  New: "bg-green-light text-green border-green-dark/30",
  Used: "bg-amber-100 text-amber-700 border-amber-300",
  Refurbished: "bg-blue-100 text-blue-700 border-blue-300",
};

const FALLBACK =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80";

// ── Photo Gallery Modal ────────────────────────────────────────
function GalleryModal({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setCurrent((i) => Math.min(images.length - 1, i + 1)),
    [images.length],
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold transition-colors"
        >
          <X size={18} strokeWidth={2} />
          Close
        </button>
        <span className="text-white/50 text-sm font-mono">
          {current + 1} / {images.length}
        </span>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative px-12 sm:px-20 min-h-0">
        <button
          onClick={prev}
          disabled={current === 0}
          className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors disabled:opacity-20"
        >
          <ChevronLeft size={20} className="text-white" strokeWidth={2} />
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
          className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors disabled:opacity-20"
        >
          <ChevronRight size={20} className="text-white" strokeWidth={2} />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex-shrink-0 px-4 py-4 overflow-x-auto">
        <div className="flex gap-2 w-max mx-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-150 ${
                current === i
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
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

// ── Airbnb-style Image Hero ────────────────────────────────────
function ImageHero({
  images,
  productName,
  condition,
  verified,
  discount,
  onShowAll,
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);

  const open = (index = 0) => {
    setGalleryStart(index);
    setGalleryOpen(true);
  };

  // Pad to at least 5 slots for the grid
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

      {/* ── Desktop: 1 big + 4 grid ── */}
      <div className="hidden md:block relative rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 gap-2" style={{ height: "480px" }}>
          {/* Main large image */}
          <div
            className="relative cursor-pointer overflow-hidden"
            onClick={() => open(0)}
          >
            <img
              src={main || FALLBACK}
              alt={productName}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => {
                e.target.src = FALLBACK;
              }}
            />
            {/* Badges on main image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-black text-white">
                  {discount}% OFF
                </span>
              )}
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${conditionStyle[condition]}`}
              >
                {condition}
              </span>
            </div>
            {verified && (
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-black text-green">
                <ShieldCheck size={12} strokeWidth={2.5} /> Verified
              </div>
            )}
          </div>

          {/* 2×2 thumbnail grid */}
          <div className="grid grid-cols-2 gap-2">
            {thumbs.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden ${img ? "cursor-pointer" : "bg-beige"}`}
                onClick={() => img && open(i + 1)}
              >
                {img ? (
                  <img
                    src={img}
                    alt={`${productName} ${i + 2}`}
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = FALLBACK;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-beige border border-beige-dark" />
                )}
                {/* "Show all photos" button on last thumb */}
                {i === 3 && images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      open(0);
                    }}
                    className="absolute bottom-3 right-3 flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-black text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-colors"
                  >
                    <Grid2X2 size={13} strokeWidth={2} />
                    Show all photos
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile: stacked scrollable images ── */}
      <div className="md:hidden">
        {/* Hero image */}
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
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black text-white">
                {discount}% OFF
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${conditionStyle[condition]}`}
            >
              {condition}
            </span>
          </div>
          {verified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-black text-green">
              <ShieldCheck size={11} strokeWidth={2.5} /> Verified
            </div>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-mono px-2.5 py-1 rounded-full">
              1 / {images.length}
            </div>
          )}
        </div>

        {/* Mini thumbnail row */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {images.slice(1).map((img, i) => (
              <button
                key={i}
                onClick={() => open(i + 1)}
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-beige-dark hover:border-black transition-colors"
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
            {/* Show all button */}
            <button
              onClick={() => open(0)}
              className="w-20 h-20 rounded-xl flex-shrink-0 border-2 border-beige-dark bg-beige hover:border-black flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Grid2X2 size={16} className="text-gray-500" strokeWidth={2} />
              <span className="text-[10px] font-bold text-gray-500 text-center leading-tight">
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

// ── Main ProductDetail ─────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("specs");
  const [copied, setCopied] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // ── Auto-scroll to top on every id change ──
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

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500 text-lg">{error || "Product not found."}</p>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-green text-sm hover:underline"
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = ["specs", "features", "overview"];

  return (
    <div className="min-h-screen bg-beige">
      {showBuyModal && (
        <BuyNowModal product={product} onClose={() => setShowBuyModal(false)} />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-beige-dark px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-400">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-1 hover:text-black transition-colors"
          >
            <ArrowLeft size={13} strokeWidth={2} /> Marketplace
          </button>
          <span>/</span>
          <span>{isPhone ? "Phones" : "Laptops"}</span>
          <span>/</span>
          <span className="text-gray-500">{product.brand}</span>
          <span>/</span>
          <span
            className="text-black font-medium truncate"
            style={{ color: "#0D1117" }}
          >
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Product title row (above images, like Airbnb) */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
              {product.brand}
            </p>
            <h1
              className="font-display font-extrabold text-2xl sm:text-3xl leading-tight"
              style={{ color: "#0D1117" }}
            >
              {product.name}
            </h1>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black underline transition-colors flex-shrink-0 mt-1"
          >
            <Share2 size={14} strokeWidth={2} />
            Share
          </button>
        </div>

        {/* ── Airbnb image hero ── */}
        <ImageHero
          images={images}
          productName={product.name}
          condition={product.condition}
          verified={product.verified}
          discount={discount}
        />

        {/* ── Two column layout below images ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 mt-10">
          {/* Left: details */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-3 pb-6 border-b border-beige-dark">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i <= Math.round(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span
                  className="font-mono font-semibold text-sm"
                  style={{ color: "#0D1117" }}
                >
                  {product.rating.toFixed(1)}
                </span>
                {product.reviews > 0 && (
                  <span className="text-gray-400 text-sm">
                    ({product.reviews} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-500 text-base leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quick specs */}
            <div>
              <h2
                className="font-display font-bold text-base mb-4"
                style={{ color: "#0D1117" }}
              >
                Quick Specs
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    className="bg-white border border-beige-dark rounded-xl px-4 py-3"
                  >
                    <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: "#0D1117" }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Listed by */}
            {product.listedBy?.shopName && (
              <div className="flex items-center gap-2 text-sm bg-beige border border-beige-dark rounded-xl px-4 py-3">
                <span className="text-gray-400 text-xs">Listed by</span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: "#0D1117" }}
                >
                  {product.listedBy.shopName}
                </span>
                {product.listedBy.location && (
                  <span className="text-gray-400 text-xs">
                    · {product.listedBy.location}
                  </span>
                )}
              </div>
            )}

            {/* ── Tabs ── */}
            <div>
              <div className="flex gap-1 bg-white border border-beige-dark rounded-xl p-1 w-fit mb-6">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                      activeTab === t
                        ? "bg-black text-white"
                        : "text-gray-500 hover:text-black"
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

              {/* Specs */}
              {activeTab === "specs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specGroups.map(({ group, fields }) => {
                    const hasAny = fields.some((f) => specs[f.key]);
                    if (!hasAny) return null;
                    return (
                      <div
                        key={group}
                        className="bg-white border border-beige-dark rounded-2xl overflow-hidden"
                      >
                        <div className="bg-beige border-b border-beige-dark px-5 py-3">
                          <h3
                            className="font-display font-bold text-sm uppercase tracking-wide"
                            style={{ color: "#0D1117" }}
                          >
                            {group}
                          </h3>
                        </div>
                        <div className="divide-y divide-beige-dark">
                          {fields.map(({ key, label, unit }) => {
                            if (!specs[key]) return null;
                            return (
                              <div key={key} className="flex gap-4 px-5 py-3">
                                <span className="text-gray-400 text-sm w-36 flex-shrink-0">
                                  {label}
                                </span>
                                <span
                                  className="text-sm font-medium leading-relaxed"
                                  style={{ color: "#0D1117" }}
                                >
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
                    <p className="text-gray-400 text-sm col-span-2">
                      No specifications listed yet.
                    </p>
                  )}
                </div>
              )}

              {/* Features */}
              {activeTab === "features" && (
                <div className="bg-white border border-beige-dark rounded-2xl p-6">
                  {product.features?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2
                            size={16}
                            className="text-green flex-shrink-0 mt-0.5"
                            strokeWidth={2}
                          />
                          <span className="text-gray-600 text-sm leading-relaxed">
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No features listed yet.
                    </p>
                  )}
                </div>
              )}

              {/* Overview */}
              {activeTab === "overview" && (
                <div className="bg-white border border-beige-dark rounded-2xl p-6">
                  <p className="text-gray-600 text-base leading-relaxed mb-6">
                    {product.shortDescription}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        className="border border-beige-dark rounded-xl px-4 py-3"
                      >
                        <p className="text-gray-400 text-xs mb-1">{label}</p>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "#0D1117" }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: sticky buy card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono font-extrabold text-3xl"
                    style={{ color: "#0D1117" }}
                  >
                    KES {product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="font-mono text-base text-gray-400 line-through">
                      KES {product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {discount && (
                  <p className="text-green-700 text-xs font-semibold mt-1">
                    You save KES{" "}
                    {(product.oldPrice - product.price).toLocaleString()} (
                    {discount}% off)
                  </p>
                )}
              </div>

              {/* Condition + verified */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${conditionStyle[product.condition]}`}
                >
                  {product.condition}
                </span>
                {product.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-black text-green border border-black">
                    <ShieldCheck size={11} strokeWidth={2.5} /> Verified
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowBuyModal(true)}
                className="w-full bg-black hover:bg-green text-white hover:text-black font-bold text-base py-4 rounded-xl border border-transparent hover:border-green-dark transition-all duration-200"
              >
                Buy Now
              </button>

              {product.verified && (
                <div className="flex items-start gap-2 text-sm text-gray-500 bg-green-light border border-green-dark/20 rounded-xl px-4 py-3">
                  <ShieldCheck
                    size={15}
                    className="text-green flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span className="text-xs leading-relaxed">
                    This device has been inspected and verified by Fixly
                  </span>
                </div>
              )}

              {/* Quick summary */}
              <div className="divide-y divide-beige-dark border border-beige-dark rounded-xl overflow-hidden text-sm">
                {[
                  {
                    label: "Category",
                    value: isPhone ? "Smartphone" : "Laptop",
                  },
                  { label: "Brand", value: product.brand },
                  { label: "RAM", value: specs.ram || "—" },
                  { label: "Storage", value: specs.storage || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-400">{label}</span>
                    <span
                      className="font-semibold"
                      style={{ color: "#0D1117" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2
              className="font-display font-extrabold text-2xl mb-6"
              style={{ color: "#0D1117" }}
            >
              More from {product.brand}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="group bg-white border border-beige-dark rounded-2xl overflow-hidden cursor-pointer hover:border-green hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-full h-40 bg-beige overflow-hidden">
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
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      {p.brand}
                    </p>
                    <h3
                      className="font-display font-bold text-sm mt-0.5 leading-tight line-clamp-2"
                      style={{ color: "#0D1117" }}
                    >
                      {p.name}
                    </h3>
                    <p
                      className="font-mono font-extrabold text-base mt-2"
                      style={{ color: "#0D1117" }}
                    >
                      KES {p.price.toLocaleString()}
                    </p>
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
