import { useState, useEffect, useMemo } from "react";
import { Loader2, Download, X } from "lucide-react";
import { getAnalyticsSummary, getShopEvents } from "../Hooks/analyticsApi";

const RANGES = [7, 30, 90];

const COLS = [
  ["pageViews", "Page visits"],
  ["uniqueVisitors", "Unique visitors"],
  ["productViews", "Product views"],
  ["whatsappClicks", "WhatsApp clicks"],
  ["callClicks", "Call clicks"],
  ["contactReveals", "Numbers unlocked"],
  ["leads", "Leads"],
];

const TYPES = [
  ["", "All"],
  ["page_view", "Page visits"],
  ["product_view", "Product views"],
  ["whatsapp_click", "WhatsApp"],
  ["call_click", "Calls"],
  ["contact_reveal", "Unlocked"],
];
const TYPE_LABEL = Object.fromEntries(TYPES.filter(([k]) => k));

const fmt = (n) => Number(n || 0).toLocaleString();

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shop, setShop] = useState(null); // selected row
  const [type, setType] = useState("");
  const [events, setEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(false);

  useEffect(() => {
    let off = false;
    setLoading(true);
    setError("");
    getAnalyticsSummary(days)
      .then((d) => !off && setRows(d.shops))
      .catch((e) => !off && setError(e.message))
      .finally(() => !off && setLoading(false));
    return () => {
      off = true;
    };
  }, [days]);

  useEffect(() => {
    if (!shop) return;
    let off = false;
    setEvLoading(true);
    getShopEvents(shop.shopId, { days, type, limit: 200 })
      .then((d) => !off && setEvents(d))
      .catch(() => !off && setEvents([]))
      .finally(() => !off && setEvLoading(false));
    return () => {
      off = true;
    };
  }, [shop, days, type]);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.leads - a.leads || b.pageViews - a.pageViews),
    [rows],
  );

  const totals = useMemo(
    () =>
      COLS.reduce((t, [k]) => ({ ...t, [k]: rows.reduce((s, r) => s + (r[k] || 0), 0) }), {}),
    [rows],
  );

  const exportCsv = () => {
    const head = ["Shop", ...COLS.map(([, l]) => l)];
    const body = sorted.map((r) => [`"${r.shopName.replace(/"/g, '""')}"`, ...COLS.map(([k]) => r[k])]);
    const csv = [head.join(","), ...body.map((r) => r.join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `fixly-shop-analytics-${days}d.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cards = [
    ["pageViews", "Page visits"],
    ["productViews", "Product views"],
    ["whatsappClicks", "WhatsApp clicks"],
    ["callClicks", "Call clicks"],
    ["contactReveals", "Numbers unlocked"],
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Shop analytics</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Activity on each shop's page. Repeat actions by the same visitor are counted once.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
            {RANGES.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  days === d ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            disabled={!rows.length}
            className="flex items-center gap-1.5 text-sm font-semibold border border-stone-200 hover:border-stone-400 bg-white rounded-xl px-3 py-2 disabled:opacity-40"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-stone-400" />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-20">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {cards.map(([k, label]) => (
              <div key={k} className="bg-white border border-stone-100 rounded-2xl px-4 py-4">
                <p className="text-[11px] uppercase tracking-wide font-semibold text-stone-400">{label}</p>
                <p className="font-mono font-extrabold text-2xl text-stone-900 mt-1">{fmt(totals[k])}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-stone-400 border-b border-stone-100">
                  <th className="px-4 py-3 font-semibold">Shop</th>
                  {COLS.map(([k, l]) => (
                    <th key={k} className="px-3 py-3 font-semibold text-right whitespace-nowrap">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sorted.map((r) => (
                  <tr
                    key={r.shopId}
                    onClick={() => {
                      setShop(r);
                      setType("");
                    }}
                    className={`cursor-pointer hover:bg-stone-50 ${shop?.shopId === r.shopId ? "bg-stone-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold text-stone-900 whitespace-nowrap">
                      {r.shopName}
                      {!r.active && <span className="ml-2 text-[10px] text-stone-400">inactive</span>}
                    </td>
                    {COLS.map(([k]) => (
                      <td
                        key={k}
                        className={`px-3 py-3 text-right font-mono ${k === "leads" ? "font-bold text-emerald-700" : "text-stone-700"}`}
                      >
                        {fmt(r[k])}
                      </td>
                    ))}
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={COLS.length + 1} className="px-4 py-10 text-center text-stone-400">
                      No shops yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            Leads = WhatsApp clicks + call clicks. Click a shop to see who did what.
          </p>

          {shop && (
            <div className="mt-6 bg-white border border-stone-100 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-stone-900">{shop.shopName}: recent activity</h2>
                <button onClick={() => setShop(null)} aria-label="Close" className="text-stone-400 hover:text-stone-900">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {TYPES.map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setType(k)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      type === k
                        ? "bg-stone-900 text-white border-stone-900"
                        : "border-stone-200 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {evLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-stone-400" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-stone-400 py-8 text-center">No activity in this period.</p>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-stone-400 border-b border-stone-100">
                        <th className="py-2 pr-4 font-semibold">When</th>
                        <th className="py-2 pr-4 font-semibold">Action</th>
                        <th className="py-2 pr-4 font-semibold">Customer</th>
                        <th className="py-2 pr-4 font-semibold">Product</th>
                        <th className="py-2 font-semibold">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {events.map((e) => (
                        <tr key={e._id}>
                          <td className="py-2 pr-4 whitespace-nowrap text-stone-500">
                            {new Date(e.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap font-semibold text-stone-800">
                            {TYPE_LABEL[e.type] || e.type}
                          </td>
                          <td className="py-2 pr-4 whitespace-nowrap text-stone-600">
                            {e.customer ? `${e.customer.name} · ${e.customer.phone}` : <span className="text-stone-300">Anonymous</span>}
                          </td>
                          <td className="py-2 pr-4 text-stone-600">
                            {e.listing ? `${e.listing.brand} ${e.listing.name}` : <span className="text-stone-300">-</span>}
                          </td>
                          <td className="py-2 text-stone-500">{e.referrer || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}