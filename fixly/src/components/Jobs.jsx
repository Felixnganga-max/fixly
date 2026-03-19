import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ArrowRight, Smartphone, Laptop } from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const MOCK_JOBS = [
  {
    _id: "1",
    name: "Amina Wanjiku",
    phone: "0712 345 678",
    location: "Westlands",
    deviceType: "phone",
    issueDescription: "Cracked screen",
    status: "Pending",
    createdAt: new Date("2025-01-15"),
    assignedTechnician: null,
  },
  {
    _id: "2",
    name: "Brian Otieno",
    phone: "0733 456 789",
    location: "South B",
    deviceType: "laptop",
    issueDescription: "Won't turn on",
    status: "Assigned",
    createdAt: new Date("2025-01-14"),
    assignedTechnician: { name: "Faith Njeri" },
  },
  {
    _id: "3",
    name: "Cynthia Kamau",
    phone: "0722 567 890",
    location: "Kilimani",
    deviceType: "phone",
    issueDescription: "Battery not charging",
    status: "Completed",
    createdAt: new Date("2025-01-13"),
    assignedTechnician: { name: "James Mwangi" },
  },
  {
    _id: "4",
    name: "David Maina",
    phone: "0798 678 901",
    location: "Kasarani",
    deviceType: "laptop",
    issueDescription: "Motherboard repair",
    status: "InProgress",
    createdAt: new Date("2025-01-12"),
    assignedTechnician: { name: "Faith Njeri" },
  },
  {
    _id: "5",
    name: "Grace Njoroge",
    phone: "0711 789 012",
    location: "Lang'ata",
    deviceType: "phone",
    issueDescription: "Speaker not working",
    status: "IssueReported",
    createdAt: new Date("2025-01-11"),
    assignedTechnician: { name: "Kevin Odhiambo" },
  },
  {
    _id: "6",
    name: "Samuel Kipchoge",
    phone: "0755 890 123",
    location: "Thika Road",
    deviceType: "laptop",
    issueDescription: "SSD upgrade needed",
    status: "Completed",
    createdAt: new Date("2025-01-10"),
    assignedTechnician: { name: "Faith Njeri" },
  },
  {
    _id: "7",
    name: "Mercy Achieng",
    phone: "0700 901 234",
    location: "Ngong Road",
    deviceType: "phone",
    issueDescription: "Water damage",
    status: "Pending",
    createdAt: new Date("2025-01-09"),
    assignedTechnician: null,
  },
  {
    _id: "8",
    name: "Peter Kamau",
    phone: "0744 012 345",
    location: "Ruiru",
    deviceType: "laptop",
    issueDescription: "OS reinstall required",
    status: "Assigned",
    createdAt: new Date("2025-01-08"),
    assignedTechnician: { name: "Faith Njeri" },
  },
];

const STATUSES = [
  "All",
  "Pending",
  "Assigned",
  "InProgress",
  "Completed",
  "IssueReported",
];
const DEVICES = ["All", "phone", "laptop"];

export default function Jobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");
  const [jobs] = useState(MOCK_JOBS);

  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.phone.includes(search) ||
      j.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || j.status === statusFilter;
    const matchDevice = deviceFilter === "All" || j.deviceType === deviceFilter;
    return matchSearch && matchStatus && matchDevice;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* ── Filters bar ── */}
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
      </div>

      {/* ── Count ── */}
      <p className="text-gray-400 text-sm">
        {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* ── Table ── */}
      <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-dark bg-beige">
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Location
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Device
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                  Issue
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-gray-400 text-sm"
                  >
                    No jobs match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
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
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        {job.deviceType === "phone" ? (
                          <Smartphone size={14} strokeWidth={1.75} />
                        ) : (
                          <Laptop size={14} strokeWidth={1.75} />
                        )}
                        <span className="capitalize">{job.deviceType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-[180px] truncate">
                      {job.issueDescription}
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
      </div>
    </div>
  );
}
