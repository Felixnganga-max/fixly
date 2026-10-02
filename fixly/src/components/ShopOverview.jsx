import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, TrendingUp, EyeOff, Eye, ShieldCheck, Clock, AlertTriangle, Plus } from "lucide-react";
import StatCard from "./StatCard";
import ShopPerformance from "./ShopPerformance";
import { getMyShop, getMyListings } from "../Hooks/shopApi";
import { addListingPath } from "../Hooks/listingsBase";

export default function ShopOverview() {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMyShop(), getMyListings({ limit: 100 })])
      .then(([s, l]) => {
        setShop(s);
        setListings(l.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-6 py-4 text-sm">
        <AlertTriangle size={16} /> {error}
      </div>
    );
  }

  const live = listings.filter((l) => l.active).length;
  const views = listings.reduce((n, l) => n + (l.views || 0), 0);
  const canSell = shop.offers?.includes("sell");
  const profileIncomplete = !shop.description || !shop.whatsapp;

  // Public page: /shop-name/shop-id (shops without a slug yet use the old /s/ link)
  const pagePath = shop.slug ? `/${shop.slug}/${shop._id}` : `/s/${shop._id}`;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Verification status */}
      <div
        className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${
          shop.verified ? "bg-green-light border-green-dark/30" : "bg-amber-50 border-amber-200"
        }`}
      >
        {shop.verified ? (
          <ShieldCheck size={18} className="text-green-dark flex-shrink-0" />
        ) : (
          <Clock size={18} className="text-amber-600 flex-shrink-0" />
        )}
        <p className="text-sm font-medium" style={{ color: "#0D1117" }}>
          {shop.verified
            ? "Your shop is verified. Customers see the Verified badge."
            : "Your shop is not verified yet. Fixly will verify it and add the Verified badge."}
        </p>
      </div>

      {profileIncomplete && (
        <div className="bg-white border border-beige-dark rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-gray-600">
            Add a description and WhatsApp number so customers can reach you.
          </p>
          <button
            onClick={() => navigate("/shop/profile")}
            className="text-sm font-semibold text-black underline"
          >
            Complete profile
          </button>
        </div>
      )}

      {canSell && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Listings" value={listings.length} icon={Tag} />
            <StatCard label="Live" value={live} icon={TrendingUp} />
            <StatCard label="Hidden" value={listings.length - live} icon={EyeOff} />
            <StatCard label="Views" value={views} icon={Eye} />
          </div>

          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm" style={{ color: "#0D1117" }}>
                Latest listings
              </h3>
              <button
                onClick={() => navigate(addListingPath())}
                className="flex items-center gap-1.5 bg-green hover:bg-green-dark text-black font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={14} strokeWidth={2.5} /> Add listing
              </button>
            </div>

            {listings.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No listings yet. Add your first device to appear on your shop page.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-beige-dark">
                {listings.slice(0, 5).map((l) => (
                  <li key={l._id} className="flex items-center justify-between py-3 gap-4">
                    <span className="text-sm font-medium truncate" style={{ color: "#0D1117" }}>
                      {l.brand} {l.name}
                    </span>
                    <span className="text-sm text-gray-500 tabular-nums flex-shrink-0">
                      KES {Number(l.price).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {!canSell && (
        <div className="bg-white border border-beige-dark rounded-2xl p-6">
          <p className="text-sm text-gray-600">
            Your shop is set up for repairs. Service listings are coming soon.
          </p>
        </div>
      )}

      <ShopPerformance />

      <p className="text-xs text-gray-400">
        Your public page:{" "}
        <a
          href={pagePath}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-gray-600 underline break-all"
        >
          {pagePath}
        </a>
      </p>
    </div>
  );
}