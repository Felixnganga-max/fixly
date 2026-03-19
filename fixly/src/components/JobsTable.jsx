import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function JobsTable({
  jobs = [],
  title = "Recent Jobs",
  limit = 8,
}) {
  const navigate = useNavigate();
  const visible = jobs.slice(0, limit);

  return (
    <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-beige-dark">
        <h3
          className="font-display font-bold text-black text-base"
          style={{ color: "#0D1117" }}
        >
          {title}
        </h3>
        <button
          onClick={() => navigate("/admin/jobs")}
          className="flex items-center gap-1.5 text-green hover:text-green-dark text-xs font-semibold transition-colors duration-200"
        >
          View all <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">
          No jobs yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-dark bg-beige">
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Device
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Technician
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
              {visible.map((job, i) => (
                <tr
                  key={job._id ?? i}
                  className="border-b border-beige-dark last:border-none hover:bg-beige/50 transition-colors duration-150 cursor-pointer"
                  onClick={() => navigate(`/admin/jobs/${job._id}`)}
                >
                  <td className="px-6 py-4">
                    <p
                      className="font-semibold text-black"
                      style={{ color: "#0D1117" }}
                    >
                      {job.name}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{job.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-600">
                      {job.deviceType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {job.assignedTechnician?.name ? (
                      <span className="text-gray-600">
                        {job.assignedTechnician.name}
                      </span>
                    ) : (
                      <span className="text-gray-300 italic">Unassigned</span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
