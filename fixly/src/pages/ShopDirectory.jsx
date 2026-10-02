import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { MapPin, ShieldCheck, Search, Loader2, Store, Wrench } from "lucide-react";
import { listPublicShops } from "../Hooks/shopPublicApi";
const CATS = { phones: "phone", laptops: "laptop" };

// Serves /shops/:category (sellers) and /repair-shops/:category (repairs)
export default function ShopDirectory() {
  const { category } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const repair = pathname.startsWith("/repair-shops");
  const cat = CATS[category];
  const title = cat ? `${cat === "phone" ? "Phone" : "Laptop"} ${repair ? "Repairs" : "Shops"}` : "";

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!cat) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    listPublicShops({ offers: repair ? "repair" : "sell", category: cat })
      .then((d) => !cancelled && setShops(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [cat, repair]);

  const visible = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? shops.filter((s) => `${s.shopName} ${s.location}`.toLowerCase().includes(t)) : shops;
  }, [shops, q]);

  if (!cat) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Page not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="font-bold text-3xl text-white">{title}</h1>
          <p className="text-stone-400 text-sm mt-2 max-w-xl">
            {repair ? "Repair shops" : "Device sellers"} on Fixly. Open a shop to see what they
            offer and get in touch.
          </p>
          <div className="relative mt-6 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or location"
              className="w-full bg-stone-800 border border-stone-700 focus:border-stone-500 text-white placeholder-stone-500 outline-none rounded-xl pl-9 pr-3 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-stone-400" />
          </div>
        ) : error ? (
          <p className="text-center text-stone-500 py-20">{error}</p>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl p-10 text-center">
            <p className="text-stone-700 font-semibold">
              {shops.length === 0 ? "No shops listed here yet" : "No shops match your search"}
            </p>
            <p className="text-stone-400 text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((s) => (
              <div
                key={s._id}
                onClick={() => navigate(s.slug ? `/${s.slug}/${s._id}` : `/s/${s._id}`)}
                className="bg-white border border-stone-100 hover:border-stone-300 hover:shadow-md rounded-2xl p-5 cursor-pointer transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-stone-900 text-emerald-400 font-semibold text-sm flex items-center justify-center flex-shrink-0">
                    {s.shopName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-stone-900 truncate">{s.shopName}</h3>
                      {s.verified && (
                        <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </div>
                    {s.location && (
                      <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={10} strokeWidth={2} className="flex-shrink-0" /> {s.location}
                      </p>
                    )}
                  </div>
                </div>
                {s.description && (
                  <p className="text-sm text-stone-500 leading-relaxed mt-3 line-clamp-2">{s.description}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {s.offers?.includes("sell") && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                      <Store size={10} /> Sells
                    </span>
                  )}
                  {s.offers?.includes("repair") && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                      <Wrench size={10} /> Repairs
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}