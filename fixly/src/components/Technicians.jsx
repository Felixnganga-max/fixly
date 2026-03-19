import { useState } from "react";
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Wrench,
  Laptop,
  Smartphone,
  X,
  CheckCircle2,
} from "lucide-react";

const MOCK_TECHS = [
  {
    _id: "t1",
    name: "James Mwangi",
    phone: "0721 111 222",
    category: "phone",
    specializations: ["Screen repair", "Battery replacement", "Water damage"],
    shopAddress: "Moi Avenue, Shop 12, CBD",
    verified: true,
    availability: "Available",
  },
  {
    _id: "t2",
    name: "Kevin Odhiambo",
    phone: "0733 222 333",
    category: "phone",
    specializations: ["Charging ports", "Speaker repair", "Camera fix"],
    shopAddress: "Ngong Road, Prestige Plaza",
    verified: true,
    availability: "Busy",
  },
  {
    _id: "t3",
    name: "Faith Njeri",
    phone: "0755 333 444",
    category: "laptop",
    specializations: ["OS installs", "SSD upgrades", "Motherboard repair"],
    shopAddress: "Westlands, Ring Rd, Suite 4B",
    verified: true,
    availability: "Available",
  },
  {
    _id: "t4",
    name: "Moses Kariuki",
    phone: "0700 444 555",
    category: "laptop",
    specializations: ["Keyboard repair", "Screen replacement", "Data recovery"],
    shopAddress: "CBD, Kimathi Street, 2nd Fl",
    verified: false,
    availability: "Offline",
  },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  category: "phone",
  specializations: "",
  shopAddress: "",
  verified: false,
};

export default function Technicians() {
  const [techs, setTechs] = useState(MOCK_TECHS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = techs.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search);
    const matchCat = catFilter === "All" || t.category === catFilter;
    return matchSearch && matchCat;
  });

  const setField = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.shopAddress) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const newTech = {
      _id: `t${Date.now()}`,
      ...form,
      specializations: form.specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      verified: form.verified === true || form.verified === "true",
      availability: "Available",
    };
    setTechs((prev) => [newTech, ...prev]);
    setForm(EMPTY_FORM);
    setShowModal(false);
    setSaving(false);
  };

  const toggleAvailability = (id) => {
    setTechs((prev) =>
      prev.map((t) => {
        if (t._id !== id) return t;
        const next = {
          Available: "Busy",
          Busy: "Offline",
          Offline: "Available",
        };
        return { ...t, availability: next[t.availability] };
      }),
    );
  };

  const toggleVerified = (id) => {
    setTechs((prev) =>
      prev.map((t) => (t._id === id ? { ...t, verified: !t.verified } : t)),
    );
  };

  const availColor = {
    Available: "text-green bg-green-light border-green-dark/30",
    Busy: "text-amber-700 bg-amber-100 border-amber-300",
    Offline: "text-gray-400 bg-gray-100 border-gray-300",
  };

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
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors duration-200"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Technician
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((tech) => (
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
                </div>
              </div>
              <button
                onClick={() => toggleAvailability(tech._id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors duration-200 ${availColor[tech.availability]}`}
              >
                {tech.availability}
              </button>
            </div>

            {/* Specs */}
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

            {/* Info */}
            <div className="flex flex-col gap-2 pt-3 border-t border-beige-dark text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin size={12} strokeWidth={1.75} />
                {tech.shopAddress}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} strokeWidth={1.75} />
                {tech.phone}
              </div>
            </div>

            {/* Verified toggle */}
            <button
              onClick={() => toggleVerified(tech._id)}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200 ${
                tech.verified
                  ? "bg-green-light border-green-dark/30 text-green"
                  : "bg-beige border-beige-dark text-gray-400 hover:border-gray-300"
              }`}
            >
              <CheckCircle2 size={13} strokeWidth={2} />
              {tech.verified ? "Verified" : "Mark as Verified"}
            </button>
          </div>
        ))}
      </div>

      {/* ── Add Technician Modal ── */}
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
                {saving ? "Saving..." : "Add Technician"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
