import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
} from "lucide-react";

const TIERS = [
  { range: "KES 0 – 2,000", commission: 200 },
  { range: "KES 2,001 – 5,000", commission: 500 },
  { range: "KES 5,001 – 10,000", commission: 1000 },
  { range: "KES 10,001+", commission: 1500 },
];

const MOCK_COMMISSIONS = [
  {
    _id: "c1",
    jobId: "1",
    techName: "James Mwangi",
    customer: "Amina Wanjiku",
    device: "phone",
    repairPrice: 3500,
    commission: 500,
    status: "Pending",
    date: new Date("2025-01-15"),
  },
  {
    _id: "c2",
    jobId: "2",
    techName: "Faith Njeri",
    customer: "Brian Otieno",
    device: "laptop",
    repairPrice: 7500,
    commission: 1000,
    status: "Paid",
    date: new Date("2025-01-14"),
  },
  {
    _id: "c3",
    jobId: "3",
    techName: "Kevin Odhiambo",
    customer: "Cynthia Kamau",
    device: "phone",
    repairPrice: 1500,
    commission: 200,
    status: "Paid",
    date: new Date("2025-01-13"),
  },
  {
    _id: "c4",
    jobId: "4",
    techName: "Faith Njeri",
    customer: "David Maina",
    device: "laptop",
    repairPrice: 12000,
    commission: 1500,
    status: "Pending",
    date: new Date("2025-01-12"),
  },
  {
    _id: "c5",
    jobId: "6",
    techName: "Faith Njeri",
    customer: "Samuel Kipchoge",
    device: "laptop",
    repairPrice: 4500,
    commission: 500,
    status: "Paid",
    date: new Date("2025-01-10"),
  },
];

export default function Commissions() {
  const [commissions, setCommissions] = useState(MOCK_COMMISSIONS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = commissions.filter((c) => {
    const matchSearch =
      !search ||
      c.techName.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const totalEarned = commissions
    .filter((c) => c.status === "Paid")
    .reduce((s, c) => s + c.commission, 0);
  const totalPending = commissions
    .filter((c) => c.status === "Pending")
    .reduce((s, c) => s + c.commission, 0);
  const totalAll = commissions.reduce((s, c) => s + c.commission, 0);

  const markPaid = (id) => {
    setCommissions((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: "Paid" } : c)),
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Earned",
            value: `KES ${totalEarned.toLocaleString()}`,
            icon: CheckCircle2,
            color: "text-green",
          },
          {
            label: "Pending Payout",
            value: `KES ${totalPending.toLocaleString()}`,
            icon: Clock,
            color: "text-amber-500",
          },
          {
            label: "All Time",
            value: `KES ${totalAll.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-blue-500",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white border border-beige-dark rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
              <Icon size={18} className={color} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-gray-400 text-xs">{label}</p>
              <p
                className="font-display font-extrabold text-xl text-black mt-0.5"
                style={{ color: "#0D1117" }}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Commission tier table */}
      <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-beige-dark">
          <h3
            className="font-display font-bold text-black text-base"
            style={{ color: "#0D1117" }}
          >
            Commission Tiers
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            Fixed flat-rate commissions per repair price range
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-dark bg-beige">
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Repair Price Range
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Platform Commission
                </th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((tier, i) => (
                <tr
                  key={i}
                  className="border-b border-beige-dark last:border-none"
                >
                  <td className="px-6 py-4 text-gray-600">{tier.range}</td>
                  <td className="px-6 py-4 font-semibold text-green font-mono">
                    KES {tier.commission.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission records */}
      <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-dark gap-4 flex-wrap">
          <h3
            className="font-display font-bold text-black text-base"
            style={{ color: "#0D1117" }}
          >
            Commission Records
          </h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-beige border border-beige-dark rounded-xl px-4 py-2">
              <Search size={13} className="text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm text-black placeholder:text-gray-400 w-36"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-beige border border-beige-dark rounded-xl px-4 py-2 text-sm text-gray-600 outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-dark bg-beige">
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Technician
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Repair Price
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Commission
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400 text-sm"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-beige-dark last:border-none hover:bg-beige/50 transition-colors duration-150"
                  >
                    <td
                      className="px-6 py-4 font-semibold text-black text-sm"
                      style={{ color: "#0D1117" }}
                    >
                      {c.techName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {c.customer}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 text-sm">
                      KES {c.repairPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-green text-sm">
                      KES {c.commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(c.date).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {c.status === "Pending" && (
                        <button
                          onClick={() => markPaid(c._id)}
                          className="text-xs font-semibold text-green hover:text-green-dark transition-colors duration-200 whitespace-nowrap"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
