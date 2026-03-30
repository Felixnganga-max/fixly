import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Wrench,
  X,
} from "lucide-react";
import {
  getAllCommissions,
  getCommissionStats,
  markCommissionPaid,
} from "../Hooks/commissionsApi";

// ── Helpers ────────────────────────────────────────────────────
const fmtKes = (n) => `KES ${Number(n).toLocaleString()}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "" | "repair" | "sale"
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [markingId, setMarkingId] = useState(null);
  const LIMIT = 20;

  // ── Load stats ─────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getCommissionStats();
      setStats(res.data);
    } catch {
      // non-fatal
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Load commissions ───────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllCommissions({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: LIMIT,
      });
      setCommissions(res.data);
      setTotal(res.total);
      setPages(Math.ceil(res.total / LIMIT));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);
  useEffect(() => {
    load();
  }, [load]);

  // ── Mark paid ──────────────────────────────────────────────
  const handleMarkPaid = async (id) => {
    setMarkingId(id);
    try {
      const res = await markCommissionPaid(id);
      setCommissions((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      loadStats(); // refresh totals
    } catch (e) {
      alert(e.message);
    } finally {
      setMarkingId(null);
    }
  };

  // ── Client-side search (name / customer) ───────────────────
  const filtered = search.trim()
    ? commissions.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.technician?.name?.toLowerCase().includes(q) ||
          c.job?.name?.toLowerCase().includes(q) ||
          c.purchase?.firstName?.toLowerCase().includes(q) ||
          c.purchase?.listingSnapshot?.name?.toLowerCase().includes(q)
        );
      })
    : commissions;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Earned",
            value: statsLoading ? "—" : fmtKes(stats?.totalEarned ?? 0),
            icon: CheckCircle2,
            color: "text-green",
          },
          {
            label: "Pending Payout",
            value: statsLoading ? "—" : fmtKes(stats?.totalPending ?? 0),
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "Repairs (9%)",
            value: statsLoading ? "—" : fmtKes(stats?.repair?.earned ?? 0),
            sub: `${fmtKes(stats?.repair?.pending ?? 0)} pending`,
            icon: Wrench,
            color: "text-blue-500",
          },
          {
            label: "Sales (4.5%)",
            value: statsLoading ? "—" : fmtKes(stats?.sale?.earned ?? 0),
            sub: `${fmtKes(stats?.sale?.pending ?? 0)} pending`,
            icon: ShoppingBag,
            color: "text-purple-500",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white border border-beige-dark rounded-2xl p-5 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
              <Icon size={18} className={color} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-gray-400 text-xs">{label}</p>
              <p
                className="font-display font-extrabold text-lg leading-tight"
                style={{ color: "#0D1117" }}
              >
                {value}
              </p>
              {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Rate info strip ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5 text-sm">
          <Wrench size={13} className="text-blue-500" strokeWidth={2} />
          <span className="text-gray-500">Repair commission</span>
          <span className="font-bold font-mono" style={{ color: "#0D1117" }}>
            9%
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5 text-sm">
          <ShoppingBag size={13} className="text-purple-500" strokeWidth={2} />
          <span className="text-gray-500">Sale commission</span>
          <span className="font-bold font-mono" style={{ color: "#0D1117" }}>
            4.5%
          </span>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => {
              load();
              loadStats();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-beige-dark bg-white text-sm font-semibold text-gray-500 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
              strokeWidth={2}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Commission records ── */}
      <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
        {/* Header + filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-beige-dark">
          <h3
            className="font-display font-bold text-base"
            style={{ color: "#0D1117" }}
          >
            Commission Records
            {total > 0 && (
              <span className="ml-2 text-xs font-semibold text-gray-400 bg-beige border border-beige-dark px-2 py-0.5 rounded-full">
                {total}
              </span>
            )}
          </h3>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-beige border border-beige-dark rounded-xl px-3 py-2">
              <Search size={13} className="text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-32"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={12} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-beige border border-beige-dark rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
            >
              <option value="">All types</option>
              <option value="repair">Repairs</option>
              <option value="sale">Sales</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-beige border border-beige-dark rounded-xl px-3 py-2 text-sm text-gray-600 outline-none cursor-pointer"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mx-6 my-4 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-dark bg-beige">
                {[
                  "Type",
                  "From",
                  "Contact",
                  "Base Price",
                  "Commission",
                  "Status",
                  "Date",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-dark">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-gray-300 mx-auto"
                    />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-gray-400 text-sm"
                  >
                    No commission records found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isRepair = c.type === "repair";
                  const fromName = isRepair
                    ? c.job?.name || "—"
                    : c.purchase?.firstName || "—";
                  const contact = isRepair
                    ? c.job?.phone || "—"
                    : c.purchase?.email || c.purchase?.phone || "—";
                  const techOrProduct = isRepair
                    ? c.technician?.name || "—"
                    : c.purchase?.listingSnapshot?.name ||
                      c.listing?.name ||
                      "—";

                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-beige/40 transition-colors"
                    >
                      {/* Type */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            isRepair
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {isRepair ? (
                            <Wrench size={11} strokeWidth={2} />
                          ) : (
                            <ShoppingBag size={11} strokeWidth={2} />
                          )}
                          {isRepair ? "Repair" : "Sale"}
                        </span>
                      </td>

                      {/* From (customer name) */}
                      <td className="px-5 py-4">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "#0D1117" }}
                        >
                          {fromName}
                        </p>
                        <p className="text-gray-400 text-xs">{techOrProduct}</p>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {contact}
                      </td>

                      {/* Base price */}
                      <td className="px-5 py-4 font-mono text-gray-600 text-sm">
                        {fmtKes(c.basePrice)}
                      </td>

                      {/* Commission */}
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-sm text-green">
                          {fmtKes(c.amount)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {isRepair ? "9%" : "4.5%"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            c.status === "Paid"
                              ? "bg-green-light text-green border-green-dark/30"
                              : "bg-amber-100 text-amber-700 border-amber-300"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {fmtDate(c.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        {c.status === "Pending" && (
                          <button
                            onClick={() => handleMarkPaid(c._id)}
                            disabled={markingId === c._id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-green hover:text-green-dark transition-colors disabled:opacity-50"
                          >
                            {markingId === c._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} strokeWidth={2} />
                            )}
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-beige-dark">
            <p className="text-sm text-gray-400">
              Page {page} of {pages} · {total} records
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-beige-dark text-sm font-semibold text-gray-500 hover:border-gray-400 transition-colors disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-4 py-2 rounded-xl border border-beige-dark text-sm font-semibold text-gray-500 hover:border-gray-400 transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
