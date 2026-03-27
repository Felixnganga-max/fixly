import { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import {
  getRequestById,
  assignRequest,
  updateRequestStatus,
} from "../Hooks/requestApi";
import { getAllTechnicians } from "../Hooks/technicianApi";

const STATUSES = [
  "Pending",
  "Assigned",
  "InProgress",
  "Completed",
  "IssueReported",
];

const statusDot = {
  Pending: "bg-amber-400",
  Assigned: "bg-blue-400",
  InProgress: "bg-purple-400",
  Completed: "bg-green",
  IssueReported: "bg-red-400",
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Data ───────────────────────────────────────────────────
  const [job, setJob] = useState(null);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [techLoad, setTechLoad] = useState(true);
  const [error, setError] = useState("");

  // ── Form state ─────────────────────────────────────────────
  const [selectedTech, setSelectedTech] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [estTime, setEstTime] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");

  // ── Save state ─────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Fetch job ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getRequestById(id);
        if (cancelled) return;
        setJob(data);
        setStatus(data.status);
        setSelectedTech(data.assignedTechnician?._id ?? "");
        setPriceMin(
          data.estimatedPriceMin ? String(data.estimatedPriceMin) : "",
        );
        setPriceMax(
          data.estimatedPriceMax ? String(data.estimatedPriceMax) : "",
        );
        setEstTime(data.estimatedTime ?? "");
        setAdminNotes(data.adminNotes ?? "");
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load job");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Fetch technicians (filtered by device type once job loads) ──
  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    const loadTechs = async () => {
      setTechLoad(true);
      try {
        const res = await getAllTechnicians({
          category: job.deviceType,
          limit: 100,
        });
        if (!cancelled) setTechs(res.data);
      } catch {
        // non-critical — show empty list
      } finally {
        if (!cancelled) setTechLoad(false);
      }
    };
    loadTechs();
    return () => {
      cancelled = true;
    };
  }, [job]);

  // ── Save handler ───────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedTech) {
      setSaveError("Please select a technician before saving.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      // 1. Assign technician + quote
      const updated = await assignRequest(id, {
        technicianId: selectedTech,
        estimatedPriceMin: priceMin ? Number(priceMin) : undefined,
        estimatedPriceMax: priceMax ? Number(priceMax) : undefined,
        estimatedTime: estTime || undefined,
        adminNotes: adminNotes || undefined,
      });

      // 2. Update status separately if it changed from what assign sets
      let finalJob = updated;
      if (status !== updated.status) {
        finalJob = await updateRequestStatus(id, status, adminNotes);
      }

      setJob(finalJob);
      setStatus(finalJob.status);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ── Status-only update (no technician required) ────────────
  const handleStatusOnly = async (newStatus) => {
    setStatus(newStatus);
    // Don't auto-save — user hits Save Changes to commit
  };

  // ── Loading / error screens ────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={26} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-gray-500">{error || "Job not found."}</p>
        <button
          onClick={() => navigate("/admin/jobs")}
          className="text-green text-sm hover:underline"
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  const DeviceIcon = job.deviceType === "phone" ? Smartphone : Laptop;
  const compatibleTechs = techs.filter((t) => t.availability !== "Offline");

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
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <button
            onClick={async () => {
              const data = await getRequestById(id);
              setJob(data);
              setStatus(data.status);
            }}
            className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <RefreshCw size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left col ── */}
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
                  icon: DeviceIcon,
                  label: "Device",
                  value: `${job.deviceType}${job.deviceModel ? ` — ${job.deviceModel}` : ""}`,
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

            {/* Issue */}
            <div className="pt-4 border-t border-beige-dark flex flex-col gap-3">
              {job.issueType && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Issue Type</p>
                  <span className="text-xs font-semibold px-3 py-1 bg-beige border border-beige-dark rounded-full text-gray-600">
                    {job.issueType}
                  </span>
                </div>
              )}
              {job.issueDescription && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Description</p>
                  <p
                    className="text-black text-sm leading-relaxed"
                    style={{ color: "#0D1117" }}
                  >
                    {job.issueDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Current assignment */}
            {job.assignedTechnician && (
              <div className="pt-4 border-t border-beige-dark">
                <p className="text-gray-400 text-xs mb-2">
                  Currently Assigned To
                </p>
                <div className="flex items-center gap-3 bg-green-light border border-green-dark/20 rounded-xl px-4 py-3">
                  <Wrench
                    size={15}
                    className="text-green flex-shrink-0"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold text-black"
                      style={{ color: "#0D1117" }}
                    >
                      {job.assignedTechnician.name}
                    </p>
                    {job.assignedTechnician.shopAddress && (
                      <p className="text-xs text-gray-500">
                        {job.assignedTechnician.shopAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assign technician */}
          <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3
                className="font-display font-bold text-black text-base"
                style={{ color: "#0D1117" }}
              >
                Assign Technician
              </h3>
              <span className="text-gray-400 text-xs capitalize">
                {job.deviceType} specialists
              </span>
            </div>

            {techLoad ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-gray-400" />
              </div>
            ) : compatibleTechs.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">
                No available {job.deviceType} technicians right now.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Unassign option */}
                <label
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${selectedTech === "" ? "border-gray-300 bg-gray-50" : "border-beige-dark hover:border-gray-300 bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="technician"
                      value=""
                      checked={selectedTech === ""}
                      onChange={() => setSelectedTech("")}
                      className="accent-green"
                    />
                    <p className="text-gray-400 text-sm italic">Unassigned</p>
                  </div>
                </label>

                {compatibleTechs.map((tech) => (
                  <label
                    key={tech._id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${selectedTech === tech._id ? "border-green bg-green-light" : "border-beige-dark hover:border-gray-300 bg-white"}`}
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
                        {tech.specializations?.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-1">
                            {tech.specializations.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="text-xs px-2 py-0.5 bg-beige border border-beige-dark text-gray-500 rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {tech.rating > 0 && (
                          <p className="text-gray-400 text-xs mt-1">
                            ★ {tech.rating.toFixed(1)} · {tech.jobsCompleted}{" "}
                            jobs
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${tech.availability === "Available" ? "bg-green-light text-green" : "bg-amber-100 text-amber-700"}`}
                    >
                      {tech.availability}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Quote details */}
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
                  <DollarSign size={13} strokeWidth={2} /> Min Price (KES)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                  style={{ color: "#0D1117" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                  <DollarSign size={13} strokeWidth={2} /> Max Price (KES)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3500"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                  style={{ color: "#0D1117" }}
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
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
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-gray-500 text-xs font-medium">
                  Admin Notes (internal)
                </label>
                <textarea
                  rows={3}
                  placeholder="Any notes for internal reference..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200 resize-none"
                  style={{ color: "#0D1117" }}
                />
              </div>
            </div>

            {/* Price range preview */}
            {(priceMin || priceMax) && (
              <div className="bg-beige border border-beige-dark rounded-xl px-4 py-3">
                <p className="text-gray-400 text-xs mb-0.5">
                  Price range preview
                </p>
                <p
                  className="font-mono font-bold text-black text-sm"
                  style={{ color: "#0D1117" }}
                >
                  {priceMin ? `KES ${Number(priceMin).toLocaleString()}` : ""}
                  {priceMin && priceMax ? " – " : ""}
                  {priceMax ? `KES ${Number(priceMax).toLocaleString()}` : ""}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right col ── */}
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
                  onClick={() => handleStatusOnly(s)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 text-left ${status === s ? "border-green bg-green-light text-green" : "border-beige-dark hover:border-gray-300 text-gray-500"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[s]}`}
                  />
                  {s === "IssueReported" ? "Issue Reported" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Save error */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{saveError}</p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-green hover:bg-green-dark disabled:opacity-60 text-black font-bold text-sm py-3.5 rounded-xl transition-colors duration-200"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving...
              </>
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
                  label={`Assigned to ${job.assignedTechnician.name}`}
                  time={job.updatedAt || job.createdAt}
                />
              )}
              {job.estimatedTime && (
                <TimelineItem
                  icon={Clock}
                  color="text-purple-500"
                  label={`Est. repair time: ${job.estimatedTime}`}
                  time={job.updatedAt || job.createdAt}
                />
              )}
              {status === "Completed" && (
                <TimelineItem
                  icon={CheckCircle2}
                  color="text-green"
                  label="Repair completed"
                  time={job.updatedAt || new Date()}
                />
              )}
              {status === "IssueReported" && (
                <TimelineItem
                  icon={AlertTriangle}
                  color="text-red-500"
                  label="Issue reported"
                  time={job.updatedAt || new Date()}
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
