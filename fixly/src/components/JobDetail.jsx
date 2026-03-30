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
  MessageCircle,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import {
  getRequestById,
  assignRequest,
  updateRequestStatus,
} from "../Hooks/requestApi";
import { getAllTechnicians } from "../Hooks/technicianApi";

const ADMIN_WHATSAPP = "254797743366"; // Your WhatsApp number in international format

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

// Converts Kenyan numbers like 0712345678 → 254712345678
function formatWhatsApp(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  return digits;
}

function WhatsAppButton({ phone, name }) {
  const waNumber = formatWhatsApp(phone);
  const message = encodeURIComponent(
    `Hello ${name}, this is TechFix Admin (0797743366). We're reaching out regarding your repair request. How can we assist you?`,
  );
  const href = `https://wa.me/${waNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-light border border-green/30 rounded-lg text-green text-sm font-semibold hover:bg-green/10 transition-colors duration-150"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="flex-shrink-0"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 0C5.374 0 0 5.373 0 12c0 2.109.549 4.089 1.513 5.812L.055 23.454c-.083.33.215.627.545.544l5.791-1.428A11.945 11.945 0 0012.004 24C18.627 24 24 18.627 24 12S18.627 0 12.004 0zm0 21.818a9.818 9.818 0 01-5.01-1.374l-.358-.213-3.716.916.964-3.622-.233-.375A9.818 9.818 0 012.182 12c0-5.42 4.402-9.818 9.822-9.818 5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
      </svg>
      {phone}
    </a>
  );
}

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

  // ── Fetch technicians ──────────────────────────────────────
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
        // non-critical
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
      const updated = await assignRequest(id, {
        technicianId: selectedTech,
        estimatedPriceMin: priceMin ? Number(priceMin) : undefined,
        estimatedPriceMax: priceMax ? Number(priceMax) : undefined,
        estimatedTime: estTime || undefined,
        adminNotes: adminNotes || undefined,
      });

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

  const handleRefresh = async () => {
    const data = await getRequestById(id);
    setJob(data);
    setStatus(data.status);
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
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* ── Back ── */}
      <button
        onClick={() => navigate("/admin/jobs")}
        className="flex items-center gap-2 text-gray-400 hover:text-black text-sm transition-colors duration-200 w-fit"
      >
        <ArrowLeft size={15} strokeWidth={2} /> Back to Jobs
      </button>

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-beige-dark">
        <div className="flex items-center gap-4">
          {/* Avatar / device icon circle */}
          <div className="w-12 h-12 rounded-2xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
            <DeviceIcon size={22} className="text-gray-500" strokeWidth={1.5} />
          </div>
          <div>
            <h2
              className="font-display font-extrabold text-2xl"
              style={{ color: "#0D1117" }}
            >
              {job.name}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5 font-mono">#{id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center hover:border-gray-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ════ LEFT / CENTRE COL ════ */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* ── Customer card ── */}
          <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
            {/* Card header strip */}
            <div className="px-6 py-4 bg-beige border-b border-beige-dark flex items-center justify-between">
              <h3
                className="font-display font-bold text-sm"
                style={{ color: "#0D1117" }}
              >
                Customer
              </h3>
              {/* Quick WhatsApp CTA in header */}
              <WhatsAppButton phone={job.phone} name={job.name} />
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User
                      size={14}
                      className="text-gray-500"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Name</p>
                    <p
                      className="text-sm font-semibold mt-0.5"
                      style={{ color: "#0D1117" }}
                    >
                      {job.name}
                    </p>
                  </div>
                </div>

                {/* Phone — WhatsApp clickable */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone
                      size={14}
                      className="text-gray-500"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Phone</p>
                    <WhatsAppButton phone={job.phone} name={job.name} />
                    <p className="text-gray-400 text-xs mt-1">
                      Tap to open WhatsApp
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin
                      size={14}
                      className="text-gray-500"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Location</p>
                    <p
                      className="text-sm font-medium mt-0.5"
                      style={{ color: "#0D1117" }}
                    >
                      {job.location}
                    </p>
                  </div>
                </div>

                {/* Device */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DeviceIcon
                      size={14}
                      className="text-gray-500"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Device</p>
                    <p
                      className="text-sm font-medium mt-0.5 capitalize"
                      style={{ color: "#0D1117" }}
                    >
                      {job.deviceType}
                      {job.deviceModel ? ` — ${job.deviceModel}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Issue section */}
              <div className="pt-4 border-t border-beige-dark flex flex-col gap-3">
                {job.issueType && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1.5">Issue Type</p>
                    <span className="text-xs font-semibold px-3 py-1 bg-beige border border-beige-dark rounded-full text-gray-600">
                      {job.issueType}
                    </span>
                  </div>
                )}
                {job.issueDescription && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Description</p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#0D1117" }}
                    >
                      {job.issueDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Currently assigned */}
              {job.assignedTechnician && (
                <div className="pt-4 border-t border-beige-dark">
                  <p className="text-gray-400 text-xs mb-2">
                    Currently Assigned To
                  </p>
                  <div className="flex items-center gap-3 bg-green-light border border-green/20 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-green/10 border border-green/20 flex items-center justify-center flex-shrink-0">
                      <Wrench
                        size={13}
                        className="text-green"
                        strokeWidth={1.75}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#0D1117" }}
                      >
                        {job.assignedTechnician.name}
                      </p>
                      {job.assignedTechnician.shopAddress && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {job.assignedTechnician.shopAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Assign technician ── */}
          <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-beige border-b border-beige-dark flex items-center justify-between">
              <h3
                className="font-display font-bold text-sm"
                style={{ color: "#0D1117" }}
              >
                Assign Technician
              </h3>
              <span className="text-gray-400 text-xs capitalize">
                {job.deviceType} specialists
              </span>
            </div>

            <div className="p-6">
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
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                      selectedTech === ""
                        ? "border-gray-300 bg-gray-50"
                        : "border-beige-dark hover:border-gray-300 bg-white"
                    }`}
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
                            className="font-semibold text-sm"
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
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
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
          </div>

          {/* ── Quote details ── */}
          <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-beige border-b border-beige-dark">
              <h3
                className="font-display font-bold text-sm"
                style={{ color: "#0D1117" }}
              >
                Quote Details
              </h3>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Min price */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                    <DollarSign size={13} strokeWidth={2} /> Min Price (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2000"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                    style={{ color: "#0D1117" }}
                  />
                </div>

                {/* Max price */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                    <DollarSign size={13} strokeWidth={2} /> Max Price (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3500"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                    style={{ color: "#0D1117" }}
                  />
                </div>

                {/* Estimated time */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                    <Clock size={13} strokeWidth={2} /> Estimated Repair Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1–2 hours"
                    value={estTime}
                    onChange={(e) => setEstTime(e.target.value)}
                    className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                    style={{ color: "#0D1117" }}
                  />
                </div>

                {/* Admin notes */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-gray-500 text-xs font-medium">
                    Admin Notes (internal)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any notes for internal reference..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200 resize-none"
                    style={{ color: "#0D1117" }}
                  />
                </div>
              </div>

              {/* Price preview */}
              {(priceMin || priceMax) && (
                <div className="bg-beige border border-beige-dark rounded-xl px-4 py-3">
                  <p className="text-gray-400 text-xs mb-0.5">
                    Price range preview
                  </p>
                  <p
                    className="font-mono font-bold text-sm"
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
        </div>

        {/* ════ RIGHT COL ════ */}
        <div className="flex flex-col gap-5">
          {/* ── Status update ── */}
          <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-beige border-b border-beige-dark">
              <h3
                className="font-display font-bold text-sm"
                style={{ color: "#0D1117" }}
              >
                Update Status
              </h3>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 text-left ${
                    status === s
                      ? "border-green bg-green-light text-green"
                      : "border-beige-dark hover:border-gray-300 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[s]}`}
                  />
                  {s === "IssueReported" ? "Issue Reported" : s}
                </button>
              ))}
            </div>
          </div>

          {/* ── Save error ── */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{saveError}</p>
            </div>
          )}

          {/* ── Save button ── */}
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

          {/* ── Timeline ── */}
          <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-beige border-b border-beige-dark">
              <h3
                className="font-display font-bold text-sm"
                style={{ color: "#0D1117" }}
              >
                Timeline
              </h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Vertical line connector */}
              <div className="relative flex flex-col gap-4">
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
                    label={`Est. time: ${job.estimatedTime}`}
                    time={job.updatedAt || job.createdAt}
                  />
                )}
                {(job.estimatedPriceMin || job.estimatedPriceMax) && (
                  <TimelineItem
                    icon={DollarSign}
                    color="text-amber-500"
                    label={`Quote: KES ${job.estimatedPriceMin?.toLocaleString() ?? "?"}${job.estimatedPriceMax ? ` – ${job.estimatedPriceMax.toLocaleString()}` : ""}`}
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

          {/* ── Quick WhatsApp contact card ── */}
          <div className="bg-green-light border border-green/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle
                size={15}
                className="text-green"
                strokeWidth={1.75}
              />
              <p className="text-green font-semibold text-sm">
                Contact Customer
              </p>
            </div>
            <p className="text-gray-500 text-xs mb-3 leading-relaxed">
              Open a WhatsApp conversation with {job.name} directly from here.
            </p>
            <WhatsAppButton phone={job.phone} name={job.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Timeline item ──────────────────────────────────────────
function TimelineItem({ icon: Icon, color, label, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={12} className={color} strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-sm" style={{ color: "#0D1117" }}>
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
