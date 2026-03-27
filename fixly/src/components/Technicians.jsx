import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Laptop,
  Smartphone,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  getAllTechnicians,
  createTechnician,
  updateAvailability,
  updateTechnician,
  deleteTechnician,
} from "../Hooks/technicianApi"; // adjust path

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  category: "phone",
  specializations: "",
  shopAddress: "",
  verified: false,
  notes: "",
};

const AVAIL_CYCLE = {
  Available: "Busy",
  Busy: "Offline",
  Offline: "Available",
};

const availColor = {
  Available: "text-green bg-green-light border-green-dark/30",
  Busy: "text-amber-700 bg-amber-100 border-amber-300",
  Offline: "text-gray-400 bg-gray-100 border-gray-300",
};

export default function Technicians() {
  // ── Data ─────────────────────────────────────────────────
  const [techs, setTechs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Filters ───────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  // ── Modal ─────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Inline action loading (per card) ─────────────────────
  const [busyId, setBusyId] = useState(null); // id currently being toggled

  // ── Fetch ─────────────────────────────────────────────────
  const fetchTechs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 100 };
      if (catFilter !== "All") params.category = catFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getAllTechnicians(params);
      setTechs(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || "Failed to load technicians");
    } finally {
      setLoading(false);
    }
  }, [catFilter, search]);

  useEffect(() => {
    const t = setTimeout(fetchTechs, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchTechs, search]);

  // ── Add technician ────────────────────────────────────────
  const setField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.shopAddress.trim()) {
      setFormErr("Name, phone and shop address are required.");
      return;
    }
    setSaving(true);
    setFormErr("");
    try {
      const payload = {
        ...form,
        specializations: form.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        verified: form.verified === true || form.verified === "true",
      };
      const created = await createTechnician(payload);
      setTechs((prev) => [created, ...prev]);
      setTotal((n) => n + 1);
      setForm(EMPTY_FORM);
      setShowModal(false);
    } catch (err) {
      setFormErr(err.message || "Failed to add technician");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle availability ───────────────────────────────────
  const handleToggleAvailability = async (tech) => {
    const next = AVAIL_CYCLE[tech.availability];
    setBusyId(tech._id);
    try {
      const updated = await updateAvailability(tech._id, next);
      setTechs((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t)),
      );
    } catch {
      // silently fail — could add toast here
    } finally {
      setBusyId(null);
    }
  };

  // ── Toggle verified ───────────────────────────────────────
  const handleToggleVerified = async (tech) => {
    setBusyId(tech._id + "_v");
    try {
      const updated = await updateTechnician(tech._id, {
        verified: !tech.verified,
      });
      setTechs((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t)),
      );
    } catch {
      // silently fail
    } finally {
      setBusyId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this technician?")) return;
    setBusyId(id + "_d");
    try {
      await deleteTechnician(id);
      setTechs((prev) => prev.filter((t) => t._id !== id));
      setTotal((n) => n - 1);
    } catch {
      // silently fail
    } finally {
      setBusyId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5 flex-1 max-w-sm">
            <Search
              size={15}
              className="text-gray-400 flex-shrink-0"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search technicians..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-black placeholder:text-gray-400 w-full"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-white border border-beige-dark rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none cursor-pointer"
          >
            <option value="All">All categories</option>
            <option value="phone">Phone</option>
            <option value="laptop">Laptop</option>
          </select>
          <button
            onClick={fetchTechs}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-beige-dark rounded-xl px-4 py-2.5 text-gray-500 hover:text-black text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <button
          onClick={() => {
            setFormErr("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors duration-200"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Technician
        </button>
      </div>

      {/* Count */}
      <p className="text-gray-400 text-sm">
        {loading
          ? "Loading..."
          : `${total} technician${total !== 1 ? "s" : ""}`}
      </p>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : techs.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
          No technicians found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {techs.map((tech) => (
            <div
              key={tech._id}
              className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-4"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center font-display font-bold text-black text-sm flex-shrink-0"
                    style={{ color: "#0D1117" }}
                  >
                    {tech.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p
                      className="font-display font-bold text-black text-sm leading-tight"
                      style={{ color: "#0D1117" }}
                    >
                      {tech.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {tech.category === "phone" ? (
                        <Smartphone
                          size={12}
                          strokeWidth={1.75}
                          className="text-gray-400"
                        />
                      ) : (
                        <Laptop
                          size={12}
                          strokeWidth={1.75}
                          className="text-gray-400"
                        />
                      )}
                      <span className="text-gray-400 text-xs capitalize">
                        {tech.category} Specialist
                      </span>
                    </div>
                    {tech.rating > 0 && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        ★ {tech.rating.toFixed(1)} · {tech.jobsCompleted} jobs
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleAvailability(tech)}
                  disabled={busyId === tech._id}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors duration-200 disabled:opacity-60 ${availColor[tech.availability]}`}
                >
                  {busyId === tech._id ? "..." : tech.availability}
                </button>
              </div>

              {/* Specializations */}
              {tech.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tech.specializations.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 bg-beige border border-beige-dark text-gray-500 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="flex flex-col gap-2 pt-3 border-t border-beige-dark text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin size={12} strokeWidth={1.75} /> {tech.shopAddress}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} strokeWidth={1.75} /> {tech.phone}
                </div>
                {tech.shopOwner?.shopName && (
                  <div className="text-gray-400 text-xs">
                    Shop: {tech.shopOwner.shopName}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleVerified(tech)}
                  disabled={busyId === tech._id + "_v"}
                  className={`flex-1 flex items-center gap-2 justify-center text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200 disabled:opacity-60 ${
                    tech.verified
                      ? "bg-green-light border-green-dark/30 text-green"
                      : "bg-beige border-beige-dark text-gray-400 hover:border-gray-300"
                  }`}
                >
                  <CheckCircle2 size={13} strokeWidth={2} />
                  {busyId === tech._id + "_v"
                    ? "..."
                    : tech.verified
                      ? "Verified"
                      : "Mark Verified"}
                </button>
                <button
                  onClick={() => handleDelete(tech._id)}
                  disabled={busyId === tech._id + "_d"}
                  className="p-2 rounded-xl border border-beige-dark text-gray-300 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-40"
                >
                  {busyId === tech._id + "_d" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Technician Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-2xl border border-beige-dark p-8 w-full max-w-md flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3
                className="font-display font-extrabold text-xl text-black"
                style={{ color: "#0D1117" }}
              >
                Add Technician
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formErr && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{formErr}</p>
              </div>
            )}

            {[
              {
                key: "name",
                label: "Full Name",
                placeholder: "e.g. James Mwangi",
                type: "text",
              },
              {
                key: "phone",
                label: "Phone Number",
                placeholder: "e.g. 0721 111 222",
                type: "tel",
              },
              {
                key: "email",
                label: "Email (optional)",
                placeholder: "e.g. james@fixly.co.ke",
                type: "email",
              },
              {
                key: "shopAddress",
                label: "Shop Address",
                placeholder: "e.g. Moi Avenue, Shop 12, CBD",
                type: "text",
              },
              {
                key: "specializations",
                label: "Specializations (comma-separated)",
                placeholder: "e.g. Screen repair, Battery replacement",
                type: "text",
              },
              {
                key: "notes",
                label: "Notes (optional)",
                placeholder: "Any additional info...",
                type: "text",
              },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-gray-500 text-xs font-medium">
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={setField(key)}
                  className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200"
                  style={{ color: "#0D1117" }}
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium">
                Category
              </label>
              <select
                value={form.category}
                onChange={setField("category")}
                className="bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-green cursor-pointer"
                style={{ color: "#0D1117" }}
              >
                <option value="phone">Phone Specialist</option>
                <option value="laptop">Laptop Specialist</option>
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-beige-dark text-gray-500 text-sm font-semibold hover:bg-beige transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-green hover:bg-green-dark text-black font-bold text-sm transition-colors duration-200 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin mx-auto" />
                ) : (
                  "Add Technician"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
