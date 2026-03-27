import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Loader2,
} from "lucide-react";
import { getListingById, getAllListings } from "../Hooks/marketplaceApi";
import BuyNowModal from "../components/BuyNow";

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("specs");
  const [copied, setCopied] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      setActiveImg(0);
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
  const images = product.images?.length
    ? product.images
    : [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
      ];
  const discount =
    product.discount ??
    (product.oldPrice
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : null);
  const specs = product.specs || {};

  const prevImg = () => setActiveImg((i) => Math.max(0, i - 1));
  const nextImg = () => setActiveImg((i) => Math.min(images.length - 1, i + 1));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = ["specs", "features", "overview"];

  return (
    <div className="min-h-screen bg-beige">
      {/* Buy Now Modal */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Images ── */}
          <div className="flex flex-col gap-4">
            <div className="relative bg-white border border-beige-dark rounded-2xl overflow-hidden aspect-square group">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-black text-white">
                    {discount}% OFF
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${conditionStyle[product.condition]}`}
                >
                  {product.condition}
                </span>
              </div>
              {product.verified && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-black text-green">
                  <ShieldCheck size={12} strokeWidth={2.5} /> Verified
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    disabled={activeImg === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-beige-dark rounded-full flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={nextImg}
                    disabled={activeImg === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-beige-dark rounded-full flex items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-30"
                  >
                    <ChevronRight size={16} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${
                      activeImg === i
                        ? "border-black"
                        : "border-beige-dark hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`rounded-full transition-all duration-200 ${
                        activeImg === i
                          ? "w-4 h-2 bg-black"
                          : "w-2 h-2 bg-beige-dark hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1">
                {product.brand}
              </p>
              <h1
                className="font-display font-extrabold text-3xl sm:text-4xl text-black leading-tight"
                style={{ color: "#0D1117" }}
              >
                {product.name}
              </h1>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-3">
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
                  className="font-mono font-semibold text-black text-sm"
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

            <div className="flex items-baseline gap-4">
              <span
                className="font-mono font-extrabold text-4xl text-black"
                style={{ color: "#0D1117" }}
              >
                KES {product.price.toLocaleString()}
              </span>
              {product.oldPrice && (
                <span className="font-mono text-xl text-gray-400 line-through">
                  KES {product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-gray-500 text-base leading-relaxed border-t border-beige-dark pt-5">
              {product.shortDescription}
            </p>

            {/* Quick specs grid */}
            <div className="grid grid-cols-2 gap-3">
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
                    className="text-black text-sm font-semibold leading-tight"
                    style={{ color: "#0D1117" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Listed by shop */}
            {product.listedBy?.shopName && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-beige border border-beige-dark rounded-xl px-4 py-3">
                <span className="text-gray-400 text-xs">Listed by</span>
                <span
                  className="font-semibold text-black text-sm"
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

            <div className="flex gap-3 pt-2">
              {/* ── Buy Now triggers modal ── */}
              <button
                onClick={() => setShowBuyModal(true)}
                className="flex-1 bg-black hover:bg-green text-white hover:text-black font-bold text-base py-4 rounded-xl border border-transparent hover:border-green-dark transition-all duration-200"
              >
                Buy Now
              </button>
              <button
                onClick={handleShare}
                className="w-14 h-14 bg-white border border-beige-dark hover:border-gray-400 rounded-xl flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                title="Copy link"
              >
                {copied ? (
                  <CheckCircle2 size={18} className="text-green" />
                ) : (
                  <Share2 size={18} className="text-gray-400" />
                )}
              </button>
            </div>

            {product.verified && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-light border border-green-dark/20 rounded-xl px-4 py-3">
                <ShieldCheck
                  size={16}
                  className="text-green flex-shrink-0"
                  strokeWidth={2}
                />
                This device has been verified by Fixly
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-14">
          <div className="flex gap-1 bg-white border border-beige-dark rounded-xl p-1 w-fit mb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        className="font-display font-bold text-black text-sm uppercase tracking-wide"
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
                              className="text-black text-sm font-medium leading-relaxed"
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
            <div className="bg-white border border-beige-dark rounded-2xl p-8">
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
                <p className="text-gray-400 text-sm">No features listed yet.</p>
              )}
            </div>
          )}

          {/* Overview */}
          {activeTab === "overview" && (
            <div className="bg-white border border-beige-dark rounded-2xl p-8">
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                {product.shortDescription}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: "Brand", value: product.brand },
                  { label: "Condition", value: product.condition },
                  {
                    label: "Verified",
                    value: product.verified ? "Yes — by Fixly" : "Not verified",
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
                  { label: "Type", value: isPhone ? "Smartphone" : "Laptop" },
                  {
                    label: "Views",
                    value: product.views?.toLocaleString() ?? "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="border border-beige-dark rounded-xl px-5 py-4"
                  >
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <p
                      className="text-black font-semibold text-sm"
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

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2
              className="font-display font-extrabold text-2xl text-black mb-6"
              style={{ color: "#0D1117" }}
            >
              More from {product.brand}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    navigate(`/product/${p._id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="group bg-white border border-beige-dark rounded-2xl overflow-hidden cursor-pointer hover:border-green hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-full h-40 bg-beige overflow-hidden">
                    <img
                      src={p.images?.[0] || ""}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      {p.brand}
                    </p>
                    <h3
                      className="font-display font-bold text-black text-sm mt-0.5 leading-tight line-clamp-2"
                      style={{ color: "#0D1117" }}
                    >
                      {p.name}
                    </h3>
                    <p
                      className="font-mono font-extrabold text-base text-black mt-2"
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
