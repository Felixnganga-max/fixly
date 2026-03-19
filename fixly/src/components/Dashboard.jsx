import { useState, useEffect } from "react";
import {
  ClipboardList,
  Wrench,
  BadgeDollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Smartphone,
  Laptop,
} from "lucide-react";
import StatCard from "./StatCard";
import JobsTable from "./JobsTable";
import StatusBadge from "./StatusBadge";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// ── Placeholder data — replace with real API calls ──────────────────────────
const MOCK_STATS = {
  totalJobs: 42,
  pendingJobs: 7,
  completedJobs: 31,
  issueJobs: 2,
  totalCommission: "KES 28,500",
  activeTechs: 9,
};

const MOCK_JOBS = [
  {
    _id: "1",
    name: "Amina Wanjiku",
    phone: "0712 345 678",
    deviceType: "phone",
    status: "Pending",
    createdAt: new Date(),
    assignedTechnician: null,
  },
  {
    _id: "2",
    name: "Brian Otieno",
    phone: "0733 456 789",
    deviceType: "laptop",
    status: "Assigned",
    createdAt: new Date(),
    assignedTechnician: { name: "James Mwangi" },
  },
  {
    _id: "3",
    name: "Cynthia Kamau",
    phone: "0722 567 890",
    deviceType: "phone",
    status: "Completed",
    createdAt: new Date(),
    assignedTechnician: { name: "Kevin Odhiambo" },
  },
  {
    _id: "4",
    name: "David Maina",
    phone: "0798 678 901",
    deviceType: "laptop",
    status: "InProgress",
    createdAt: new Date(),
    assignedTechnician: { name: "Faith Njeri" },
  },
  {
    _id: "5",
    name: "Grace Njoroge",
    phone: "0711 789 012",
    deviceType: "phone",
    status: "IssueReported",
    createdAt: new Date(),
    assignedTechnician: { name: "James Mwangi" },
  },
  {
    _id: "6",
    name: "Samuel Kipchoge",
    phone: "0755 890 123",
    deviceType: "laptop",
    status: "Completed",
    createdAt: new Date(),
    assignedTechnician: { name: "Faith Njeri" },
  },
];

// ── Status breakdown data ────────────────────────────────────────────────────
const statusBreakdown = [
  { status: "Pending", count: 7, icon: Clock },
  { status: "Assigned", count: 3, icon: ClipboardList },
  { status: "InProgress", count: 1, icon: Wrench },
  { status: "Completed", count: 31, icon: CheckCircle2 },
  { status: "IssueReported", count: 2, icon: AlertTriangle },
];

export default function Dashboard() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(false);

  // Swap out the mock below with real fetch once backend is ready:
  // useEffect(() => {
  //   fetch(`${API}/admin/jobs`)
  //     .then(r => r.json())
  //     .then(data => setJobs(data.data ?? []));
  // }, []);

  const phoneJobs = jobs.filter((j) => j.deviceType === "phone").length;
  const laptopJobs = jobs.filter((j) => j.deviceType === "laptop").length;

  return (
    <div className="flex flex-col gap-8 max-w-7xl">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Jobs"
          value={stats.totalJobs}
          icon={ClipboardList}
          trend={12}
          trendLabel="vs last week"
        />
        <StatCard
          label="Pending"
          value={stats.pendingJobs}
          icon={Clock}
          trend={0}
        />
        <StatCard
          label="Completed"
          value={stats.completedJobs}
          icon={CheckCircle2}
          trend={8}
          trendLabel="vs last week"
        />
        <StatCard
          label="Issues"
          value={stats.issueJobs}
          icon={AlertTriangle}
          trend={-1}
          trendLabel="vs last week"
        />
        <StatCard
          label="Commission"
          value={stats.totalCommission}
          icon={BadgeDollarSign}
          trend={15}
          trendLabel="this month"
        />
        <StatCard
          label="Active Techs"
          value={stats.activeTechs}
          icon={Wrench}
        />
      </div>

      {/* ── Device split + Status breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Device split */}
        <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
          <h3
            className="font-display font-bold text-black text-base"
            style={{ color: "#0D1117" }}
          >
            Jobs by Device
          </h3>
          <div className="flex flex-col gap-4">
            {/* Phone bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Smartphone size={15} strokeWidth={1.75} />
                  <span>Phone</span>
                </div>
                <span
                  className="font-semibold text-black"
                  style={{ color: "#0D1117" }}
                >
                  {phoneJobs}
                </span>
              </div>
              <div className="w-full bg-beige rounded-full h-2">
                <div
                  className="bg-green h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${jobs.length ? (phoneJobs / jobs.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            {/* Laptop bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Laptop size={15} strokeWidth={1.75} />
                  <span>Laptop</span>
                </div>
                <span
                  className="font-semibold text-black"
                  style={{ color: "#0D1117" }}
                >
                  {laptopJobs}
                </span>
              </div>
              <div className="w-full bg-beige rounded-full h-2">
                <div
                  className="bg-black h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${jobs.length ? (laptopJobs / jobs.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-auto pt-2 border-t border-beige-dark">
            {jobs.length} total jobs tracked
          </p>
        </div>

        {/* Status breakdown */}
        <div className="lg:col-span-2 bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
          <h3
            className="font-display font-bold text-black text-base"
            style={{ color: "#0D1117" }}
          >
            Status Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statusBreakdown.map(({ status, count, icon: Icon }) => (
              <div
                key={status}
                className="flex flex-col gap-2 bg-beige border border-beige-dark rounded-xl p-4"
              >
                <StatusBadge status={status} />
                <p
                  className="font-display font-extrabold text-2xl text-black leading-none"
                  style={{ color: "#0D1117" }}
                >
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent jobs table ── */}
      <JobsTable jobs={jobs} title="Recent Jobs" limit={8} />
    </div>
  );
}
