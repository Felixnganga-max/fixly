import { useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Users, Tag, MousePointerClick, ArrowUpDown, X, ShieldCheck, AlertTriangle } from "lucide-react";
import StatsChart from "./StatsChart";
import ShopStatsPanel, { RangePicker, Delta, Metric } from "./ShopStatsPanel";
import { getAnalyticsOverview } from "../Hooks/analyticsApi";

const COLS = [
  { key: "shopViews", label: "Views" },
  { key: "visitors", label: "Visitors" },
  { key: "listingViews", label: "Listing views" },
  { key: "calls", label: "Calls" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "directions", label: "Directions" },
  { key: "rate", label: "Contact rate" },
];

/** Admin dashboard section — every shop's traffic and taps */
export default function ShopAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: "shopViews", dir: -1 });
  const [open, setOpen] = useState(null); // shop row

  useEffect(() => {
    setLoading(true);
    setError("");
    getAnalyticsOverview(days)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  const rows = useMemo(() => {
    if (!data) return [];
    return [...data.shops].sort((a, b) => (a[sort.key] - b[sort.key]) * sort.dir || a.shopName.localeCompare(b.shopName));
  }, [data, sort]);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: -1 }));
  const t = data?.totals;

  return (
    <div>
      {/* Section header — same pattern as the rest of the dashboard */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
          <BarChart3 size={14} className="text-white" strokeWidth={2} />
        </div>
        <h2 className="font-display font-extrabold text-base" style={{ color: "#0D1117" }}>Shop Performance</h2>
        <div className="flex-1 h-px bg-beige-dark ml-2" />
        <RangePicker days={days} onChange={setDays} />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {loading || !t ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Metric icon={Eye} label="Shop page views" value={t.shopViews}>
              <Delta now={t.shopViews} before={data.prev.shopViews} />
            </Metric>
            <Metric icon={Users} label="Unique visitors" value={t.visitors} />
            <Metric icon={Tag} label="Listing views" value={t.listingViews} />
            <Metric icon={MousePointerClick} label="Contact taps" value={t.actions}>
              <Delta now={t.actions} before={data.prev.actions} />
            </Metric>
          </div>

          <div className="bg-white border border-beige-dark rounded-2xl p-5">
            <StatsChart series={data.series} />
          </div>

          <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-beige-dark bg-beige/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Shop</th>
                    {COLS.map((c) => (
                      <th key={c.key} className="px-3 py-3 text-right">
                        <button
                          onClick={() => toggleSort(c.key)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${
                            sort.key === c.key ? "text-black" : "text-gray-400 hover:text-black"
                          }`}
                        >
                          {c.label} <ArrowUpDown size={11} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={COLS.length + 1} className="py-10 text-center text-sm text-gray-400">No shops yet.</td></tr>
                  ) : (
                    rows.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setOpen(r)}
                        className="border-b border-beige-dark last:border-0 hover:bg-beige/50 cursor-pointer transition"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm" style={{ color: "#0D1117" }}>{r.shopName}</span>
                            {r.verified && <ShieldCheck size={13} className="text-green-700" />}
                            {!r.active && <span className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5">inactive</span>}
                          </div>
                        </td>
                        {COLS.map((c) => (
                          <td key={c.key} className="px-3 py-3.5 text-right text-sm tabular-nums text-gray-700">
                            {c.key === "rate" ? `${r.rate}%` : r[c.key].toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Drill-down */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setOpen(null)}>
          <div className="bg-beige rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-beige-dark bg-white rounded-t-2xl">
              <h2 className="font-display font-extrabold text-base" style={{ color: "#0D1117" }}>{open.shopName}</h2>
              <button onClick={() => setOpen(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-beige hover:text-black transition">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <ShopStatsPanel shopId={open.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}