import { useState, useEffect } from "react";
import {
  ClipboardList,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Smartphone,
  Laptop,
  ShoppingBag,
  ShieldCheck,
  Tag,
  PackageCheck,
  PhoneCall,
  XCircle,
  LayoutGrid,
  TrendingUp,
  BadgeDollarSign,
} from "lucide-react";
import StatCard from "./StatCard";
import JobsTable from "./JobsTable";
import StatusBadge from "./StatusBadge";
import { fetchDashboardData } from "../Hooks/dashboardApi";

// ── Helpers ────────────────────────────────────────────────────
const fmtKes = (n) =>
  n >= 1000
    ? `KES ${(n / 1000).toFixed(1)}k`
    : `KES ${Number(n).toLocaleString()}`;

// ── Purchase status config ──────────────────────────────────────
const PURCHASE_STATUSES = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  {
    key: "contacted",
    label: "Contacted",
    icon: PhoneCall,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  {
    key: "completed",
    label: "Completed",
    icon: PackageCheck,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    dot: "bg-red-400",
  },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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

  const {
    repairStats,
    commissionStats,
    recentJobs,
    techCount,
    marketplaceStats,
    purchaseStats,
  } = data;

  const totalJobs = repairStats.total ?? 0;
  const phoneJobs = repairStats.phones ?? 0;
  const laptopJobs = repairStats.laptops ?? 0;
  const mktTotal = marketplaceStats.total ?? 0;
  const mktPhones = marketplaceStats.phones ?? 0;
  const mktLaptops = marketplaceStats.laptops ?? 0;

  const statusBreakdown = [
    { status: "Pending", count: repairStats.pending ?? 0 },
    { status: "Assigned", count: repairStats.assigned ?? 0 },
    { status: "InProgress", count: repairStats.inProgress ?? 0 },
    { status: "Completed", count: repairStats.completed ?? 0 },
    { status: "IssueReported", count: repairStats.issueReported ?? 0 },
  ];

  const conversionRate =
    purchaseStats.total > 0
      ? Math.round((purchaseStats.completed / purchaseStats.total) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-10 max-w-7xl">
      {/* ══════════════════════════════════════════════════
          SECTION 1 — MARKETPLACE & SALES
      ══════════════════════════════════════════════════ */}
      <div>
        <SectionLabel icon={LayoutGrid} label="Marketplace & Sales" />

        {/* Summary stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total Listings" value={mktTotal} icon={Tag} />
          <StatCard
            label="Active"
            value={marketplaceStats.active ?? 0}
            icon={TrendingUp}
          />
          <StatCard
            label="Verified"
            value={marketplaceStats.verified ?? 0}
            icon={ShieldCheck}
          />
          <StatCard
            label="Purchase Reqs"
            value={purchaseStats.total ?? 0}
            icon={ShoppingBag}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Inventory breakdown ── */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
            <h3
              className="font-display font-bold text-sm"
              style={{ color: "#0D1117" }}
            >
              Inventory Breakdown
            </h3>

            <div className="flex flex-col gap-4">
              <DeviceBar
                icon={Smartphone}
                label="Phones"
                count={mktPhones}
                total={mktTotal}
                color="bg-green"
              />
              <DeviceBar
                icon={Laptop}
                label="Laptops"
                count={mktLaptops}
                total={mktTotal}
                color="bg-black"
              />
            </div>

            {/* Condition split */}
            <div className="pt-3 border-t border-beige-dark">
              <p className="text-xs text-gray-400 mb-3">By Condition</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  {
                    label: "New",
                    count: marketplaceStats.byCondition?.new ?? 0,
                    cls: "bg-green-100 text-green-700 border-green-200",
                  },
                  {
                    label: "Used",
                    count: marketplaceStats.byCondition?.used ?? 0,
                    cls: "bg-amber-100 text-amber-700 border-amber-200",
                  },
                  {
                    label: "Refurbished",
                    count: marketplaceStats.byCondition?.refurbished ?? 0,
                    cls: "bg-blue-100  text-blue-700  border-blue-200",
                  },
                ].map(({ label, count, cls }) => (
                  <span
                    key={label}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cls}`}
                  >
                    {label} · {count}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-gray-400 text-xs mt-auto pt-2 border-t border-beige-dark">
              {mktTotal} listings total · {marketplaceStats.active ?? 0} active
            </p>
          </div>

          {/* ── Purchase funnel ── */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3
                className="font-display font-bold text-sm"
                style={{ color: "#0D1117" }}
              >
                Purchase Funnel
              </h3>
              {purchaseStats.total > 0 && (
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                  {conversionRate}% converted
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {PURCHASE_STATUSES.map(
                ({ key, label, icon: Icon, bg, border, text, dot }) => {
                  const count = purchaseStats[key] ?? 0;
                  const pct =
                    purchaseStats.total > 0
                      ? (count / purchaseStats.total) * 100
                      : 0;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${bg} ${border}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
                      />
                      <Icon
                        size={13}
                        className={`${text} flex-shrink-0`}
                        strokeWidth={2}
                      />
                      <span className={`text-xs font-semibold flex-1 ${text}`}>
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        {purchaseStats.total > 0 && (
                          <div className="w-14 bg-white/70 rounded-full h-1.5 hidden sm:block">
                            <div
                              className={`h-1.5 rounded-full ${dot}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                        <span
                          className={`text-sm font-extrabold font-mono ${text}`}
                        >
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* Recent pending names */}
            {purchaseStats.recentPending?.length > 0 && (
              <div className="pt-3 border-t border-beige-dark">
                <p className="text-xs text-gray-400 mb-2">Latest pending</p>
                <div className="flex flex-wrap gap-1.5">
                  {purchaseStats.recentPending.slice(0, 4).map((r) => (
                    <span
                      key={r._id}
                      className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-medium"
                    >
                      {r.firstName}
                    </span>
                  ))}
                  {purchaseStats.pending > 4 && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                      +{purchaseStats.pending - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Commission summary ── */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-4">
            <h3
              className="font-display font-bold text-sm"
              style={{ color: "#0D1117" }}
            >
              Commission Summary
            </h3>
            <div className="flex flex-col gap-3">
              <CommissionRow
                label="Total Earned"
                value={fmtKes(commissionStats.totalEarned ?? 0)}
                sub="Paid out to date"
                highlight
              />
              <CommissionRow
                label="Pending Payout"
                value={fmtKes(commissionStats.totalPending ?? 0)}
                sub="Awaiting payment"
              />
              <CommissionRow
                label="Total Records"
                value={commissionStats.count ?? 0}
                sub="Commission entries"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — REPAIR JOBS
      ══════════════════════════════════════════════════ */}
      <div>
        <SectionLabel icon={Wrench} label="Repair Jobs" />

        {/* Repair stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <StatCard label="Total Jobs" value={totalJobs} icon={ClipboardList} />
          <StatCard
            label="Pending"
            value={repairStats.pending ?? 0}
            icon={Clock}
          />
          <StatCard
            label="In Progress"
            value={repairStats.inProgress ?? 0}
            icon={ClipboardList}
          />
          <StatCard
            label="Completed"
            value={repairStats.completed ?? 0}
            icon={CheckCircle2}
          />
          <StatCard
            label="Issues"
            value={repairStats.issueReported ?? 0}
            icon={AlertTriangle}
          />
          <StatCard label="Active Techs" value={techCount} icon={Wrench} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Device split */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
            <h3
              className="font-display font-bold text-sm"
              style={{ color: "#0D1117" }}
            >
              Jobs by Device
            </h3>
            <div className="flex flex-col gap-4">
              <DeviceBar
                icon={Smartphone}
                label="Phone"
                count={phoneJobs}
                total={totalJobs}
                color="bg-green"
              />
              <DeviceBar
                icon={Laptop}
                label="Laptop"
                count={laptopJobs}
                total={totalJobs}
                color="bg-black"
              />
            </div>
            <p className="text-gray-400 text-xs mt-auto pt-2 border-t border-beige-dark">
              {totalJobs} total jobs tracked
            </p>
          </div>

          {/* Status breakdown */}
          <div className="lg:col-span-2 bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
            <h3
              className="font-display font-bold text-sm"
              style={{ color: "#0D1117" }}
            >
              Status Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {statusBreakdown.map(({ status, count }) => (
                <div
                  key={status}
                  className="flex flex-col gap-2 bg-beige border border-beige-dark rounded-xl p-4"
                >
                  <StatusBadge status={status} />
                  <p
                    className="font-display font-extrabold text-2xl leading-none"
                    style={{ color: "#0D1117" }}
                  >
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent repair jobs table ── */}
      <JobsTable jobs={recentJobs} title="Recent Repair Jobs" limit={8} />
    </div>
  );
}

// ── Section label ──────────────────────────────────────────────
function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-white" strokeWidth={2} />
      </div>
      <h2
        className="font-display font-extrabold text-base"
        style={{ color: "#0D1117" }}
      >
        {label}
      </h2>
      <div className="flex-1 h-px bg-beige-dark ml-2" />
    </div>
  );
}

// ── Device progress bar ────────────────────────────────────────
function DeviceBar({ icon: Icon, label, count, total, color }) {
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Icon size={15} strokeWidth={1.75} />
          <span>{label}</span>
        </div>
        <span className="font-semibold" style={{ color: "#0D1117" }}>
          {count}
        </span>
      </div>
      <div className="w-full bg-beige rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Commission summary row ─────────────────────────────────────
function CommissionRow({ label, value, sub, highlight }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
        highlight ? "bg-black border-black" : "bg-beige border-beige-dark"
      }`}
    >
      <div>
        <p
          className={`text-xs font-semibold ${highlight ? "text-white/70" : "text-gray-400"}`}
        >
          {label}
        </p>
        <p
          className={`text-xs mt-0.5 ${highlight ? "text-white/40" : "text-gray-400"}`}
        >
          {sub}
        </p>
      </div>
      <p
        className={`font-mono font-extrabold text-base ${highlight ? "text-white" : ""}`}
        style={highlight ? {} : { color: "#0D1117" }}
      >
        {value}
      </p>
    </div>
  );
}
