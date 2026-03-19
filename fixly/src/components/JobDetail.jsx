import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  MapPin,
  Phone,
  User,
  Wrench,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";

const MOCK_JOB = {
  _id: "1",
  name: "Amina Wanjiku",
  phone: "0712 345 678",
  location: "Westlands, Nairobi",
  deviceType: "phone",
  issueDescription:
    "Screen cracked after the phone dropped. Touch is unresponsive on the lower half of the screen.",
  status: "Pending",
  estimatedPriceRange: "",
  createdAt: new Date("2025-01-15"),
  assignedTechnician: null,
};

const MOCK_TECHNICIANS = [
  {
    _id: "t1",
    name: "James Mwangi",
    category: "phone",
    shopAddress: "Moi Avenue, Shop 12, CBD",
    availability: "Available",
  },
  {
    _id: "t2",
    name: "Kevin Odhiambo",
    category: "phone",
    shopAddress: "Ngong Road, Prestige Plaza",
    availability: "Available",
  },
  {
    _id: "t3",
    name: "Faith Njeri",
    category: "laptop",
    shopAddress: "Westlands, Ring Rd, Suite 4B",
    availability: "Busy",
  },
];

const STATUSES = [
  "Pending",
  "Assigned",
  "InProgress",
  "Completed",
  "IssueReported",
];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(MOCK_JOB);
  const [selectedTech, setSelectedTech] = useState(
    job.assignedTechnician?._id ?? "",
  );
  const [priceRange, setPriceRange] = useState(job.estimatedPriceRange ?? "");
  const [estTime, setEstTime] = useState("");
  const [status, setStatus] = useState(job.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const compatibleTechs = MOCK_TECHNICIANS.filter(
    (t) => t.category === job.deviceType,
  );

  const handleSave = async () => {
    setSaving(true);
    // Replace with real API call:
    // await fetch(`/api/requests/${id}/assign`, { method: "PATCH", body: JSON.stringify({ technicianId: selectedTech, estimatedPriceRange: priceRange, status }) })
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate("/admin/jobs")}
        className="flex items-center gap-2 text-gray-400 hover:text-black text-sm transition-colors duration-200 w-fit"
      >
        <ArrowLeft size={15} strokeWidth={2} /> Back to Jobs
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="font-display font-extrabold text-2xl text-black"
            style={{ color: "#0D1117" }}
          >
            {job.name}
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Job ID: {id}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left — job info ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Customer info */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-4">
            <h3
              className="font-display font-bold text-black text-base"
              style={{ color: "#0D1117" }}
            >
              Customer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Name", value: job.name },
                { icon: Phone, label: "Phone", value: job.phone },
                { icon: MapPin, label: "Location", value: job.location },
                {
                  icon: job.deviceType === "phone" ? Smartphone : Laptop,
                  label: "Device",
                  value: job.deviceType,
                  capitalize: true,
                },
              ].map(({ icon: Icon, label, value, capitalize }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon
                      size={14}
                      className="text-gray-500"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p
                      className={`text-black text-sm font-medium mt-0.5 ${capitalize ? "capitalize" : ""}`}
                      style={{ color: "#0D1117" }}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-beige-dark">
              <p className="text-gray-400 text-xs mb-1">Issue Description</p>
              <p
                className="text-black text-sm leading-relaxed"
                style={{ color: "#0D1117" }}
              >
                {job.issueDescription}
              </p>
            </div>
          </div>

          {/* Assign technician */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
            <h3
              className="font-display font-bold text-black text-base"
              style={{ color: "#0D1117" }}
            >
              Assign Technician
            </h3>

            {compatibleTechs.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No verified {job.deviceType} technicians available.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {compatibleTechs.map((tech) => (
                  <label
                    key={tech._id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                      selectedTech === tech._id
                        ? "border-green bg-green-light"
                        : "border-beige-dark hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="technician"
                        value={tech._id}
                        checked={selectedTech === tech._id}
                        onChange={() => setSelectedTech(tech._id)}
                        className="accent-green"
                      />
                      <div>
                        <p
                          className="font-semibold text-black text-sm"
                          style={{ color: "#0D1117" }}
                        >
                          {tech.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {tech.shopAddress}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        tech.availability === "Available"
                          ? "bg-green-light text-green"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {tech.availability}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price + time */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
            <h3
              className="font-display font-bold text-black text-base"
              style={{ color: "#0D1117" }}
            >
              Quote Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                  <DollarSign size={13} strokeWidth={2} /> Estimated Price Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. KES 2,000 – 3,500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                  style={{ color: "#0D1117" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                  <Clock size={13} strokeWidth={2} /> Estimated Repair Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1–2 hours"
                  value={estTime}
                  onChange={(e) => setEstTime(e.target.value)}
                  className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                  style={{ color: "#0D1117" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right — actions ── */}
        <div className="flex flex-col gap-5">
          {/* Status update */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-4">
            <h3
              className="font-display font-bold text-black text-base"
              style={{ color: "#0D1117" }}
            >
              Update Status
            </h3>
            <div className="flex flex-col gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 text-left ${
                    status === s
                      ? "border-green bg-green-light text-green"
                      : "border-beige-dark hover:border-gray-300 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      s === "Pending"
                        ? "bg-amber-400"
                        : s === "Assigned"
                          ? "bg-blue-400"
                          : s === "InProgress"
                            ? "bg-purple-400"
                            : s === "Completed"
                              ? "bg-green"
                              : "bg-red-400"
                    }`}
                  />
                  {s === "IssueReported" ? "Issue Reported" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-green hover:bg-green-dark disabled:opacity-60 text-black font-bold text-sm py-3.5 rounded-xl transition-colors duration-200"
          >
            {saving ? (
              "Saving..."
            ) : saved ? (
              <>
                <CheckCircle2 size={16} /> Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>

          {/* Timeline */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-4">
            <h3
              className="font-display font-bold text-black text-base"
              style={{ color: "#0D1117" }}
            >
              Timeline
            </h3>
            <div className="flex flex-col gap-3">
              <TimelineItem
                icon={CheckCircle2}
                color="text-green"
                label="Request submitted"
                time={job.createdAt}
              />
              {job.assignedTechnician && (
                <TimelineItem
                  icon={Wrench}
                  color="text-blue-500"
                  label="Technician assigned"
                  time={job.createdAt}
                />
              )}
              {status === "Completed" && (
                <TimelineItem
                  icon={CheckCircle2}
                  color="text-green"
                  label="Repair completed"
                  time={new Date()}
                />
              )}
              {status === "IssueReported" && (
                <TimelineItem
                  icon={AlertTriangle}
                  color="text-red-500"
                  label="Issue reported"
                  time={new Date()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon: Icon, color, label, time }) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={15}
        className={`${color} flex-shrink-0 mt-0.5`}
        strokeWidth={2}
      />
      <div>
        <p className="text-sm text-black" style={{ color: "#0D1117" }}>
          {label}
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          {new Date(time).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
