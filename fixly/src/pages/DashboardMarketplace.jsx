import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  ShieldCheck,
  ShieldOff,
  X,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  Star,
  ImagePlus,
  Minus,
} from "lucide-react";
import {
  PHONE_PRODUCTS,
  LAPTOP_PRODUCTS,
  PHONE_BRANDS,
  LAPTOP_BRANDS,
  PHONE_SPEC_GROUPS,
  LAPTOP_SPEC_GROUPS,
} from "../assets/Productassets";

// ── Constants ─────────────────────────────────────────────────
const CONDITIONS = ["New", "Used", "Refurbished"];
const PHONE_BRANDS_ = PHONE_BRANDS.filter((b) => b !== "All");
const LAPTOP_BRANDS_ = LAPTOP_BRANDS.filter((b) => b !== "All");

const EMPTY_FORM = {
  category: "phone",
  brand: "",
  name: "",
  price: "",
  oldPrice: "",
  condition: "New",
  verified: false,
  rating: "5.0",
  reviews: "0",
  shortDescription: "",
  images: [""],
  features: [""],
  specs: {},
};

const conditionStyle = {
  New: "bg-green-light text-green border-green-dark/30",
  Used: "bg-amber-100 text-amber-700 border-amber-300",
  Refurbished: "bg-blue-100 text-blue-700 border-blue-300",
};

const seed = () => [
  ...PHONE_PRODUCTS.map((p) => ({ ...p, category: "phone", active: true })),
  ...LAPTOP_PRODUCTS.map((p) => ({ ...p, category: "laptop", active: true })),
];

// ── Helpers ───────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-green" : "bg-beige-dark"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function SectionAccordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        border: "1px solid var(--color-beige-dark)",
        borderRadius: "10px",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "var(--color-beige)",
          cursor: "pointer",
          borderRadius: open ? "10px 10px 0 0" : "10px",
          border: "none",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "14px",
          color: "#0D1117",
        }}
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp size={16} color="#8B949E" />
        ) : (
          <ChevronDown size={16} color="#8B949E" />
        )}
      </button>
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--color-beige-dark)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "white",
            borderRadius: "0 0 10px 10px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: 500, color: "#8B949E" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = (err) =>
  `w-full bg-beige border rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200 ${
    err ? "border-error" : "border-beige-dark hover:border-gray-400"
  }`;

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = "text-gray-500" }) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl px-6 py-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
        <Icon size={18} className={color} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p
          className="font-display font-extrabold text-2xl text-black mt-0.5"
          style={{ color: "#0D1117" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── ProductRow ────────────────────────────────────────────────
function ProductRow({
  product,
  onEdit,
  onToggleActive,
  onToggleVerified,
  onDelete,
}) {
  const DevIcon = product.category === "phone" ? Smartphone : Laptop;
  const img = Array.isArray(product.images) ? product.images[0] : product.image;
  return (
    <tr
      className={`border-b border-beige-dark last:border-none transition-colors duration-150 ${product.active ? "hover:bg-beige/40" : "opacity-50 bg-beige/20"}`}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-beige border border-beige-dark flex-shrink-0">
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=60";
              }}
            />
          </div>
          <div>
            <p
              className="font-semibold text-sm text-black leading-tight"
              style={{ color: "#0D1117" }}
            >
              {product.name}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">{product.brand}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <DevIcon size={13} strokeWidth={1.75} />
          <span className="capitalize">{product.category}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${conditionStyle[product.condition]}`}
        >
          {product.condition}
        </span>
      </td>
      <td className="px-5 py-4">
        <p
          className="font-mono font-bold text-black text-sm"
          style={{ color: "#0D1117" }}
        >
          KES {Number(product.price).toLocaleString()}
        </p>
        {product.oldPrice && (
          <p className="font-mono text-xs text-gray-400 line-through mt-0.5">
            KES {Number(product.oldPrice).toLocaleString()}
          </p>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-sm text-gray-600">
            {Number(product.rating).toFixed(1)}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => onToggleVerified(product.id)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
            product.verified
              ? "bg-green-light text-green border-green-dark/30"
              : "bg-beige text-gray-400 border-beige-dark hover:border-gray-300"
          }`}
        >
          {product.verified ? (
            <>
              <ShieldCheck size={12} strokeWidth={2} /> Verified
            </>
          ) : (
            <>
              <ShieldOff size={12} strokeWidth={2} /> Unverified
            </>
          )}
        </button>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => onToggleActive(product.id)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
            product.active
              ? "bg-black text-white border-black"
              : "bg-beige text-gray-400 border-beige-dark"
          }`}
        >
          {product.active ? (
            <>
              <Eye size={12} /> Live
            </>
          ) : (
            <>
              <EyeOff size={12} /> Hidden
            </>
          )}
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center hover:border-gray-400 hover:bg-white transition-all"
          >
            <Edit2 size={13} className="text-gray-500" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} className="text-gray-400" strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── ProductModal ──────────────────────────────────────────────
function ProductModal({ mode, initial, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    if (!initial) return { ...EMPTY_FORM };
    return {
      ...initial,
      price: String(initial.price ?? ""),
      oldPrice: String(initial.oldPrice ?? ""),
      rating: String(initial.rating ?? "5.0"),
      reviews: String(initial.reviews ?? "0"),
      images:
        Array.isArray(initial.images) && initial.images.length
          ? [...initial.images]
          : [""],
      features:
        Array.isArray(initial.features) && initial.features.length
          ? [...initial.features]
          : [""],
      specs: initial.specs ? { ...initial.specs } : {},
    };
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const brands = form.category === "phone" ? PHONE_BRANDS_ : LAPTOP_BRANDS_;
  const specGroups =
    form.category === "phone" ? PHONE_SPEC_GROUPS : LAPTOP_SPEC_GROUPS;

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setSpec = (k) => (e) => {
    setForm((f) => ({ ...f, specs: { ...f.specs, [k]: e.target.value } }));
  };

  // Images array helpers
  const setImage = (i, v) => {
    const imgs = [...form.images];
    imgs[i] = v;
    setField("images", imgs);
  };
  const addImage = () => setField("images", [...form.images, ""]);
  const removeImage = (i) =>
    setField(
      "images",
      form.images.filter((_, idx) => idx !== i),
    );

  // Features array helpers
  const setFeature = (i, v) => {
    const f = [...form.features];
    f[i] = v;
    setField("features", f);
  };
  const addFeature = () => setField("features", [...form.features, ""]);
  const removeFeature = (i) =>
    setField(
      "features",
      form.features.filter((_, idx) => idx !== i),
    );

  const validate = () => {
    const e = {};
    if (!form.brand) e.brand = "Required";
    if (!form.name.trim()) e.name = "Required";
    if (!form.price) e.price = "Required";
    if (!form.shortDescription.trim()) e.shortDescription = "Required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    onSave({
      ...form,
      id: form.id ?? `p_${Date.now()}`,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      rating: Number(form.rating) || 5.0,
      reviews: Number(form.reviews) || 0,
      images: form.images.filter(Boolean),
      features: form.features.filter(Boolean),
      active: form.active ?? true,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl border border-beige-dark w-full max-w-3xl flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-beige-dark flex-shrink-0">
          <h2
            className="font-display font-extrabold text-xl text-black"
            style={{ color: "#0D1117" }}
          >
            {mode === "add"
              ? "Add New Listing"
              : `Edit — ${form.name || "Listing"}`}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center hover:border-gray-400 transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 flex flex-col gap-5">
          {/* ── Core Info ── */}
          <SectionAccordion title="Core Information" defaultOpen>
            {/* Category */}
            <FieldRow label="Category">
              <div className="flex gap-2">
                {["phone", "laptop"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        category: cat,
                        brand: "",
                        specs: {},
                      }))
                    }
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all duration-150 ${
                      form.category === cat
                        ? "bg-black text-white border-black"
                        : "bg-beige border-beige-dark text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {cat === "phone" ? (
                      <Smartphone size={14} strokeWidth={1.75} />
                    ) : (
                      <Laptop size={14} strokeWidth={1.75} />
                    )}
                    {cat}
                  </button>
                ))}
              </div>
            </FieldRow>

            {/* Brand */}
            <FieldRow label="Brand *">
              <select
                value={form.brand}
                onChange={(e) => {
                  setField("brand", e.target.value);
                  setErrors((er) => ({ ...er, brand: "" }));
                }}
                className={inputCls(errors.brand)}
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              {errors.brand && (
                <p className="text-error text-xs mt-1">{errors.brand}</p>
              )}
            </FieldRow>

            {/* Name */}
            <FieldRow label="Device Name *">
              <input
                type="text"
                placeholder="e.g. iPhone 15 Pro"
                value={form.name}
                onChange={(e) => {
                  setField("name", e.target.value);
                  setErrors((er) => ({ ...er, name: "" }));
                }}
                className={inputCls(errors.name)}
              />
              {errors.name && (
                <p className="text-error text-xs mt-1">{errors.name}</p>
              )}
            </FieldRow>

            {/* Price + Old Price */}
            <FieldRow label="Price (KES) *">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    placeholder="e.g. 55000"
                    value={form.price}
                    onChange={(e) => {
                      setField("price", e.target.value);
                      setErrors((er) => ({ ...er, price: "" }));
                    }}
                    className={inputCls(errors.price)}
                  />
                  {errors.price && (
                    <p className="text-error text-xs mt-1">{errors.price}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Old price (optional)"
                    value={form.oldPrice}
                    onChange={(e) => setField("oldPrice", e.target.value)}
                    className={inputCls(false)}
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Leave blank if no discount
                  </p>
                </div>
              </div>
            </FieldRow>

            {/* Condition + Rating + Reviews */}
            <FieldRow label="Condition">
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={form.condition}
                  onChange={(e) => setField("condition", e.target.value)}
                  className={inputCls(false)}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="Rating (0–5)"
                  value={form.rating}
                  onChange={(e) => setField("rating", e.target.value)}
                  className={inputCls(false)}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Review count"
                  value={form.reviews}
                  onChange={(e) => setField("reviews", e.target.value)}
                  className={inputCls(false)}
                />
              </div>
            </FieldRow>

            {/* Short description */}
            <FieldRow label="Short Description *">
              <textarea
                rows={3}
                placeholder="Brief marketing description of the device..."
                value={form.shortDescription}
                onChange={(e) => {
                  setField("shortDescription", e.target.value);
                  setErrors((er) => ({ ...er, shortDescription: "" }));
                }}
                className={`${inputCls(errors.shortDescription)} resize-none`}
              />
              {errors.shortDescription && (
                <p className="text-error text-xs mt-1">
                  {errors.shortDescription}
                </p>
              )}
            </FieldRow>

            {/* Verified + Active */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-beige border border-beige-dark rounded-xl px-4 py-3">
                <div>
                  <p
                    className="text-black text-sm font-semibold"
                    style={{ color: "#0D1117" }}
                  >
                    Verified
                  </p>
                  <p className="text-gray-400 text-xs">Show verified badge</p>
                </div>
                <Toggle
                  checked={!!form.verified}
                  onChange={(v) => setField("verified", v)}
                />
              </div>
              <div className="flex items-center justify-between bg-beige border border-beige-dark rounded-xl px-4 py-3">
                <div>
                  <p
                    className="text-black text-sm font-semibold"
                    style={{ color: "#0D1117" }}
                  >
                    Live on site
                  </p>
                  <p className="text-gray-400 text-xs">Visible to customers</p>
                </div>
                <Toggle
                  checked={form.active !== false}
                  onChange={(v) => setField("active", v)}
                />
              </div>
            </div>
          </SectionAccordion>

          {/* ── Images ── */}
          <SectionAccordion
            title={`Images (${form.images.filter(Boolean).length})`}
            defaultOpen
          >
            <div className="flex flex-col gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-beige-dark flex-shrink-0 bg-beige">
                    {img && (
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    {!img && (
                      <ImagePlus
                        size={16}
                        className="m-auto mt-2.5 text-gray-400"
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Image URL ${i + 1}`}
                    value={img}
                    onChange={(e) => setImage(i, e.target.value)}
                    className={`${inputCls(false)} flex-1`}
                  />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      <Minus
                        size={13}
                        className="text-red-500"
                        strokeWidth={2}
                      />
                    </button>
                  )}
                </div>
              ))}
              {form.images.length < 10 && (
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center gap-2 text-sm text-green hover:text-green-dark font-semibold transition-colors w-fit"
                >
                  <Plus size={14} strokeWidth={2.5} /> Add another image
                </button>
              )}
              <p className="text-gray-400 text-xs">
                Paste Unsplash or direct image URLs. First image is the main
                thumbnail.
              </p>
            </div>
          </SectionAccordion>

          {/* ── Key Features ── */}
          <SectionAccordion
            title={`Key Features (${form.features.filter(Boolean).length})`}
          >
            <div className="flex flex-col gap-2">
              {form.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Feature ${i + 1}`}
                    value={feat}
                    onChange={(e) => setFeature(i, e.target.value)}
                    className={`${inputCls(false)} flex-1`}
                  />
                  {form.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      <Minus
                        size={13}
                        className="text-red-500"
                        strokeWidth={2}
                      />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 text-sm text-green hover:text-green-dark font-semibold transition-colors w-fit"
              >
                <Plus size={14} strokeWidth={2.5} /> Add feature
              </button>
            </div>
          </SectionAccordion>

          {/* ── Spec Groups — dynamic based on category ── */}
          {specGroups.map(({ group, fields }) => (
            <SectionAccordion key={group} title={`Specs — ${group}`}>
              {fields.map(({ key, label, unit }) => (
                <FieldRow
                  key={key}
                  label={`${label}${unit ? ` (${unit})` : ""}`}
                >
                  <input
                    type="text"
                    placeholder={
                      unit ? `e.g. value in ${unit}` : `e.g. ${label}`
                    }
                    value={form.specs[key] ?? ""}
                    onChange={setSpec(key)}
                    className={inputCls(false)}
                  />
                </FieldRow>
              ))}
            </SectionAccordion>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-7 py-5 border-t border-beige-dark flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-beige-dark text-gray-500 text-sm font-semibold hover:bg-beige transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green hover:bg-green-dark text-black font-bold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={15} /> Saved!
              </>
            ) : mode === "add" ? (
              "Add Listing"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DashboardMarketplace ──────────────────────────────────────
export default function DashboardMarketplace() {
  const [products, setProducts] = useState(seed);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [condFilter, setCondFilter] = useState("All");
  const [verFilter, setVerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const total = products.length;
  const live = products.filter((p) => p.active).length;
  const verified = products.filter((p) => p.verified).length;
  const phones = products.filter((p) => p.category === "phone").length;

  const displayed = useMemo(() => {
    let list = products.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      const matchCat = catFilter === "all" || p.category === catFilter;
      const matchCond = condFilter === "All" || p.condition === condFilter;
      const matchVer =
        verFilter === "all" ||
        (verFilter === "verified" ? p.verified : !p.verified);
      return matchSearch && matchCat && matchCond && matchVer;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });
  }, [products, search, catFilter, condFilter, verFilter, sortBy]);

  const handleSave = (product) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      return exists
        ? prev.map((p) => (p.id === product.id ? product : p))
        : [product, ...prev];
    });
    setModal(null);
  };

  const handleToggleActive = (id) =>
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  const handleToggleVerified = (id) =>
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p)),
    );

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 600));
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleting(false);
    setDeleteId(null);
  };

  const filterBtn = (active) =>
    `px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
      active
        ? "bg-black text-white border-black"
        : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"
    }`;

  return (
    <div className="flex flex-col gap-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="font-display font-extrabold text-2xl text-black"
            style={{ color: "#0D1117" }}
          >
            Marketplace
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Add, edit and manage all device listings.
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors duration-200"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Listing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total listings" value={total} icon={Package} />
        <StatCard
          label="Live on site"
          value={live}
          icon={Eye}
          color="text-green"
        />
        <StatCard
          label="Verified"
          value={verified}
          icon={ShieldCheck}
          color="text-blue-500"
        />
        <StatCard
          label="Phone listings"
          value={phones}
          icon={Smartphone}
          color="text-amber-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-beige-dark rounded-2xl p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-beige border border-beige-dark rounded-xl px-4 py-2.5 flex-1 min-w-48">
          <Search
            size={14}
            className="text-gray-400 flex-shrink-0"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-full"
            style={{ color: "#0D1117" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[
            ["all", "All"],
            ["phone", "Phones"],
            ["laptop", "Laptops"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCatFilter(val)}
              className={filterBtn(catFilter === val)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={condFilter}
          onChange={(e) => setCondFilter(e.target.value)}
          className="bg-beige border border-beige-dark rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none cursor-pointer"
        >
          <option value="All">All conditions</option>
          {["New", "Used", "Refurbished"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={verFilter}
          onChange={(e) => setVerFilter(e.target.value)}
          className="bg-beige border border-beige-dark rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none cursor-pointer"
        >
          <option value="all">All listings</option>
          <option value="verified">Verified only</option>
          <option value="unverified">Unverified only</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-beige border border-beige-dark rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none cursor-pointer"
        >
          <option value="name">Sort: Name A–Z</option>
          <option value="price_asc">Sort: Price Low–High</option>
          <option value="price_desc">Sort: Price High–Low</option>
          <option value="rating">Sort: Top Rated</option>
        </select>
      </div>

      <p className="text-gray-400 text-sm -mt-2">
        {displayed.length} listing{displayed.length !== 1 ? "s" : ""} shown
      </p>

      {/* Table */}
      <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige-dark bg-beige">
                {[
                  "Device",
                  "Category",
                  "Condition",
                  "Price",
                  "Rating",
                  "Verified",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-gray-400 text-sm"
                  >
                    No listings match your filters.
                  </td>
                </tr>
              ) : (
                displayed.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEdit={(p) => setModal({ mode: "edit", product: p })}
                    onToggleActive={handleToggleActive}
                    onToggleVerified={handleToggleVerified}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          mode={modal.mode}
          initial={modal.product}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white rounded-2xl border border-beige-dark p-8 w-full max-w-sm flex flex-col gap-5">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <Trash2 size={20} className="text-red-500" strokeWidth={1.75} />
            </div>
            <div className="text-center">
              <h3
                className="font-display font-bold text-black text-xl"
                style={{ color: "#0D1117" }}
              >
                Delete listing?
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                This will permanently remove the listing. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-beige-dark text-gray-500 text-sm font-semibold hover:bg-beige transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-colors"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
