import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ArrowRight,
  Smartphone,
  Laptop,
  Loader2,
  RefreshCw,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getAllRequests } from "../Hooks/requestApi"; // adjust path

const STATUSES = [
  "All",
  "Pending",
  "Assigned",
  "InProgress",
  "Completed",
  "IssueReported",
];
const DEVICES = ["All", "phone", "laptop"];
const LIMIT = 20;

export default function Jobs() {
  const navigate = useNavigate();

  // ── Filters ─────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");

  // ── Pagination ───────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ── Data state ───────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch ────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: LIMIT,
        sortBy: "createdAt",
        order: "desc",
      };
      if (statusFilter !== "All") params.status = statusFilter;
      if (deviceFilter !== "All") params.deviceType = deviceFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getAllRequests(params);
      setJobs(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, deviceFilter, search]);

  // Re-fetch whenever filters or page change
  useEffect(() => {
    // Debounce search input by 400 ms, immediate for other changes
    const timer = setTimeout(fetchJobs, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchJobs, search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, deviceFilter, search]);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5 flex-1">
          <Search
            size={15}
            className="text-gray-400 flex-shrink-0"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search by name, phone or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-black placeholder:text-gray-400 w-full"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5">
          <Filter
            size={14}
            className="text-gray-400 flex-shrink-0"
            strokeWidth={2}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-600 cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Device filter */}
        <div className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-600 cursor-pointer"
          >
            {DEVICES.map((d) => (
              <option key={d} value={d}>
                {d === "All"
                  ? "All devices"
                  : d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5 text-gray-500 hover:text-black text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Count */}
      <p className="text-gray-400 text-sm">
        {loading ? "Loading..." : `${total} job${total !== 1 ? "s" : ""} found`}
      </p>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-dark bg-beige">
                {[
                  "Customer",
                  "Location",
                  "Device",
                  "Issue",
                  "Technician",
                  "Status",
                  "Date",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Loader2
                      size={20}
                      className="animate-spin text-gray-400 mx-auto"
                    />
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-gray-400 text-sm"
                  >
                    No jobs match your filters.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job._id}
                    onClick={() => navigate(`/admin/jobs/${job._id}`)}
                    className="border-b border-beige-dark last:border-none hover:bg-beige/50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p
                        className="font-semibold text-black"
                        style={{ color: "#0D1117" }}
                      >
                        {job.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {job.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {job.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                          {job.deviceType === "phone" ? (
                            <Smartphone size={14} strokeWidth={1.75} />
                          ) : (
                            <Laptop size={14} strokeWidth={1.75} />
                          )}
                          <span className="capitalize">{job.deviceType}</span>
                        </div>
                        {job.deviceModel && (
                          <span className="text-gray-400 text-xs">
                            {job.deviceModel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-[180px] truncate">
                      {job.issueType || job.issueDescription || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {job.assignedTechnician?.name ? (
                        <span className="text-gray-600 text-sm">
                          {job.assignedTechnician.name}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <ArrowRight size={14} className="text-gray-300" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && !loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-beige-dark">
            <p className="text-gray-400 text-xs">
              Page {page} of {pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-beige-dark rounded-lg text-gray-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 text-xs border border-beige-dark rounded-lg text-gray-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
