import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, AlertTriangle, Loader2 } from "lucide-react";
import StatsChart from "./StatsChart";

export const RANGES = [7, 30, 90];

// Metric keys returned by /analytics/summary (and /analytics/mine/summary)
export const COLS = [
  { key: "pageViews", label: "Page views" },
  { key: "uniqueVisitors", label: "Visitors" },
  { key: "productViews", label: "Product views" },
  { key: "whatsappClicks", label: "WhatsApp" },
  { key: "callClicks", label: "Calls" },
  { key: "contactReveals", label: "Contact reveals" },
  { key: "leads", label: "Leads" },
];

export const num = (v) => Number(v || 0);

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

export function Metric({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="font-display font-extrabold text-2xl tabular-nums" style={{ color: "#0D1117" }}>
        {num(value).toLocaleString()}
      </span>
    </div>
  );
}

// ── Event helpers (type names aren't assumed — matched loosely) ─────────
const isView = (t = "") => /view/i.test(t);
const isAction = (t = "") => /click|reveal|lead|call|whatsapp|contact/i.test(t);
const prettyType = (t = "") =>
  String(t)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

const nairobiDay = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

function buildSeries(events, days) {
  const byDay = {};
  events.forEach((e) => {
    if (!e.createdAt) return;
    const k = nairobiDay(e.createdAt);
    const row = (byDay[k] ||= { views: 0, actions: 0 });
    if (isView(e.type)) row.views += 1;
    else if (isAction(e.type)) row.actions += 1;
  });
  return Array.from({ length: days }, (_, i) => {
    const date = nairobiDay(Date.now() - (days - 1 - i) * 864e5);
    return { date, views: byDay[date]?.views || 0, actions: byDay[date]?.actions || 0 };
  });
}

const timeAgo = (d) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

const detail = (e) =>
  e.listing?.name || e.productName || e.listingName || e.product?.name || e.customer?.name || e.name || "";

/**
 * One shop's numbers + chart + activity.
 *  metrics    — a summary row ({ pageViews, uniqueVisitors, ... })
 *  shopKey    — changes when the shop changes (re-fetches events)
 *  loadEvents — (days, limit) => Promise<events[] | { events }>
 */
export function ShopDetail({ metrics, days, shopKey, loadEvents }) {
  const LIMIT = 500;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loader = useRef(loadEvents);
  loader.current = loadEvents;

  useEffect(() => {
    setLoading(true);
    setError("");
    loader
      .current(days, LIMIT)
      .then((d) => setEvents(Array.isArray(d) ? d : d?.events || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [shopKey, days]);

  const counts = useMemo(() => {
    const m = {};
    events.forEach((e) => (m[e.type] = (m[e.type] || 0) + 1));
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [events]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {COLS.map((c) => (
          <Metric key={c.key} icon={Eye} label={c.label} value={metrics?.[c.key]} />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={15} /> {error}
        </div>
      ) : (
        <>
          <div className="bg-white border border-beige-dark rounded-2xl p-5">
            <StatsChart series={buildSeries(events, days)} />
            {events.length >= LIMIT && (
              <p className="text-xs text-gray-400 mt-2">Chart uses the latest {LIMIT} events.</p>
            )}
          </div>

          {counts.length > 0 && (
            <div className="bg-white border border-beige-dark rounded-2xl p-5">
              <h4 className="font-display font-bold text-sm mb-3" style={{ color: "#0D1117" }}>By event</h4>
              <div className="flex gap-2 flex-wrap">
                {counts.map(([type, n]) => (
                  <span key={type} className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-beige border-beige-dark text-gray-600">
                    {prettyType(type)} · {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-beige-dark rounded-2xl p-5">
            <h4 className="font-display font-bold text-sm mb-3" style={{ color: "#0D1117" }}>Recent activity</h4>
            {events.length === 0 ? (
              <p className="text-sm text-gray-400">No activity in this period.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-beige-dark">
                {events.slice(0, 25).map((e, i) => (
                  <li key={e._id || i} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isAction(e.type) && !isView(e.type) ? "bg-green" : "bg-gray-300"}`} />
                    <span className="font-medium" style={{ color: "#0D1117" }}>{prettyType(e.type)}</span>
                    {detail(e) && <span className="text-gray-400 truncate flex-1 min-w-0">{detail(e)}</span>}
                    <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{e.createdAt ? timeAgo(e.createdAt) : ""}</span>
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