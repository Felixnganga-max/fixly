import { useEffect, useState } from "react";
import { Eye, Users, Tag, PhoneCall, MessageCircle, MapPin, MousePointerClick, AlertTriangle } from "lucide-react";
import StatsChart from "./StatsChart";
import { getShopAnalytics, getMyAnalytics } from "../Hooks/analyticsApi";

export const RANGES = [7, 30, 90];

export function RangePicker({ days, onChange }) {
  return (
    <div className="flex gap-1.5">
      {RANGES.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            days === d ? "bg-black text-white border-black" : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"
          }`}
        >
          {d}d
        </button>
      ))}
    </div>
  );
}

export function Delta({ now, before }) {
  if (before === undefined) return null;
  if (!before && !now) return null;
  if (!before) return <span className="text-xs font-semibold text-green-700">new</span>;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return <span className="text-xs text-gray-400">no change</span>;
  return (
    <span className={`text-xs font-semibold ${pct > 0 ? "text-green-700" : "text-red-500"}`}>
      {pct > 0 ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

export function Metric({ icon: Icon, label, value, children }) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display font-extrabold text-2xl tabular-nums" style={{ color: "#0D1117" }}>
          {Number(value).toLocaleString()}
        </span>
        {children}
      </div>
    </div>
  );
}

/**
 * One shop's numbers.
 *   <ShopStatsPanel shopId="…" />   admin drill-down
 *   <ShopStatsPanel mine />         shop owner's own dashboard
 */
export default function ShopStatsPanel({ shopId, mine = false }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    (mine ? getMyAnalytics(days) : getShopAnalytics(shopId, days))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [shopId, mine, days]);

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
        <AlertTriangle size={15} /> {error}
      </div>
    );
  }

  const t = data?.totals;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display font-bold text-sm" style={{ color: "#0D1117" }}>
          {mine ? "Your page performance" : data?.shop?.shopName || "Shop performance"}
        </h3>
        <RangePicker days={days} onChange={setDays} />
      </div>

      {loading || !t ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric icon={Eye} label="Page views" value={t.shopViews}>
              <Delta now={t.shopViews} before={data.prev.shopViews} />
            </Metric>
            <Metric icon={Users} label="Visitors" value={t.visitors} />
            <Metric icon={Tag} label="Listing views" value={t.listingViews} />
            <Metric icon={MousePointerClick} label="Contact rate" value={`${t.rate}`}>
              <span className="text-xs text-gray-400">% of visitors</span>
            </Metric>
            <Metric icon={PhoneCall} label="Call taps" value={t.calls} />
            <Metric icon={MessageCircle} label="WhatsApp taps" value={t.whatsapp} />
            <Metric icon={MapPin} label="Directions taps" value={t.directions} />
            <Metric icon={MousePointerClick} label="All actions" value={t.actions}>
              <Delta now={t.actions} before={data.prev.actions} />
            </Metric>
          </div>

          <div className="bg-white border border-beige-dark rounded-2xl p-5">
            <StatsChart series={data.series} />
          </div>

          <div className="bg-white border border-beige-dark rounded-2xl p-5">
            <h4 className="font-display font-bold text-sm mb-3" style={{ color: "#0D1117" }}>
              Top listings
            </h4>
            {data.topListings.length === 0 ? (
              <p className="text-sm text-gray-400">No listing activity yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-beige-dark">
                {data.topListings.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-10 h-10 rounded-lg bg-beige border border-beige-dark overflow-hidden flex-shrink-0">
                      {l.image && <img src={l.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="flex-1 min-w-0 text-sm font-medium truncate" style={{ color: "#0D1117" }}>
                      {l.name}
                    </span>
                    <span className="text-xs text-gray-500 tabular-nums">{l.views} views</span>
                    <span className="text-xs text-green-700 font-semibold tabular-nums w-20 text-right">{l.clicks} taps</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}