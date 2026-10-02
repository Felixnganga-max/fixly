import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, MapPin, Loader2, Search, ArrowLeft, Star } from "lucide-react";
import { getShopBySlug } from "../Hooks/shopPublicApi";
import { track } from "../Hooks/analytics";
import useSeo from "../Hooks/useSeo";
import ContactSellerButton from "../components/ContactSellerButton";

const FALLBACK =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80";

const CONDITION_STYLE = {
  New: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Used: "bg-amber-50 text-amber-700 border-amber-200",
  Refurbished: "bg-sky-50 text-sky-700 border-sky-200",
};

// Public shop page at /:shopName/:shopId  (old /s/:slug links redirect here)
export default function ShopPage() {
  const { slug, shopId } = useParams();
  const key = shopId || slug; // the API accepts a shop id or a slug
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getShopBySlug(key)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message || "Shop not found"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [key]);

  const shop = data?.shop;
  const listings = data?.listings || [];

  // Always end up on the canonical /shop-name/shop-id URL
  useEffect(() => {
    if (!shop?.slug) return;
    if (slug !== shop.slug || shopId !== String(shop._id)) {
      navigate(`/${shop.slug}/${shop._id}`, { replace: true });
    }
  }, [shop, slug, shopId, navigate]);

  // Page visit (the server ignores repeats from the same visitor within 30 min)
  useEffect(() => {
    if (shop?._id) track({ type: "page_view", shop: shop._id });
  }, [shop?._id]);

  // Search-engine tags
  const place = shop?.location ? ` in ${shop.location}` : "";
  const canonical = shop?.slug ? `${window.location.origin}/${shop.slug}/${shop._id}` : undefined;
  useSeo({
    title: shop ? `${shop.shopName}${place} | Fixly World` : "",
    description: shop
      ? (shop.description || `${shop.shopName}${place}. Browse phones, laptops and repairs on Fixly World.`).slice(0, 155)
      : "",
    canonical,
    jsonLd: shop && {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: shop.shopName,
      url: canonical,
      ...(shop.description && { description: shop.description }),
      ...(shop.logo && { image: shop.logo }),
      ...(shop.location && {
        address: { "@type": "PostalAddress", addressLocality: shop.location, addressCountry: "KE" },
      }),
    },
  });

  const counts = useMemo(
    () => ({
      all: listings.length,
      phone: listings.filter((l) => l.category === "phone").length,
      laptop: listings.filter((l) => l.category === "laptop").length,
    }),
    [listings],
  );

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (tab === "all" || l.category === tab) &&
        (!term || `${l.name} ${l.brand}`.toLowerCase().includes(term)),
    );
  }, [listings, tab, q]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-stone-700 text-lg font-semibold">This shop page isn't available</p>
        <p className="text-stone-400 text-sm max-w-sm">
          The link may be wrong, or the shop is not active right now.
        </p>
        <button onClick={() => navigate("/marketplace")} className="text-emerald-600 text-sm hover:underline">
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "all", label: "All" },
    { id: "phone", label: "Phones" },
    { id: "laptop", label: "Laptops" },
  ].filter((t) => t.id === "all" || counts[t.id] > 0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Compact header */}
      <div className="bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-1.5 text-stone-400 hover:text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft size={12} strokeWidth={2} /> Marketplace
          </button>

          <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-xl sm:text-2xl text-white leading-tight">{shop.shopName}</h1>
                {shop.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck size={10} strokeWidth={2.5} /> Verified
                  </span>
                )}
              </div>
              {shop.location && (
                <p className="flex items-center gap-1.5 text-stone-400 text-sm mt-1">
                  <MapPin size={12} strokeWidth={2} /> {shop.location}
                </p>
              )}
            </div>

            <div className="w-full md:w-72">
              <ContactSellerButton shop={shop} dark />
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {shop.description && (
          <p className="text-stone-500 text-sm leading-relaxed max-w-2xl mb-6">{shop.description}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex gap-1 bg-white border border-stone-200 rounded-2xl p-1 w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.id ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {t.label} <span className="text-xs opacity-60">{counts[t.id]}</span>
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search this shop"
              className="w-full bg-white border border-stone-200 focus:border-stone-400 outline-none rounded-xl pl-9 pr-3 py-2.5 text-sm"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-10 text-center">
            <p className="text-stone-700 font-semibold">
              {listings.length === 0 ? "No devices listed yet" : "Nothing matches your search"}
            </p>
            <p className="text-stone-400 text-sm mt-1">
              {listings.length === 0
                ? "Get the seller's number above to ask what they have in stock."
                : "Try a different brand or model name."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visible.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/product/${p._id}`)}
                className="group bg-white border border-stone-100 rounded-2xl overflow-hidden cursor-pointer hover:border-stone-300 hover:shadow-md transition-all duration-300"
              >
                <div className="relative w-full h-40 bg-stone-50 overflow-hidden">
                  <img
                    src={p.images?.[0] || FALLBACK}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = FALLBACK;
                    }}
                  />
                  {p.condition && (
                    <span
                      className={`absolute top-2.5 left-2.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${CONDITION_STYLE[p.condition] || ""}`}
                    >
                      {p.condition}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-stone-400 text-[10px] uppercase tracking-widest font-semibold">{p.brand}</p>
                  <h3 className="font-semibold text-sm mt-0.5 leading-tight line-clamp-2 text-stone-900">{p.name}</h3>
                  {p.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] text-stone-400">{p.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="font-mono font-extrabold text-sm text-stone-900">
                      KES {Number(p.price).toLocaleString()}
                    </p>
                    {p.oldPrice && (
                      <p className="font-mono text-[10px] text-stone-400 line-through">
                        KES {Number(p.oldPrice).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}