import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, KeyRound, Pencil, Trash2, Copy, Check, MessageCircle,
  X, Loader2, Smartphone, Laptop, Wrench, ShoppingBag, ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  getAllShopOwners,
  createShopOwner,
  updateShopOwner,
  toggleVerified,
  toggleActive,
  resetShopPassword,
  deleteShopOwner,
} from "../Hooks/shopOwners";

// ─── constants ────────────────────────────────────────────────
const EMPTY_FORM = {
  ownerName: "",
  shopName: "",
  phone: "",
  email: "",
  location: "",
  category: [],
  offers: ["sell"],
  description: "",
  verified: false,
  notes: "",
};

const inputCls = (err) =>
  `w-full bg-beige border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green transition-colors placeholder:text-gray-400 ${
    err ? "border-red-400" : "border-beige-dark"
  }`;

const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

// ─── helpers ──────────────────────────────────────────────────
// Kenyan numbers → wa.me format (254XXXXXXXXX)
function waNumber(phone = "") {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254")) return d;
  if (d.startsWith("0")) return `254${d.slice(1)}`;
  if (d.length === 9) return `254${d}`;
  return d;
}

function credentialsMessage({ ownerName, shopName, email, tempPassword }) {
  return (
    `Hi ${ownerName}, your shop "${shopName}" is set up on Fixly Kenya.\n\n` +
    `Login: ${window.location.origin}/login\n` +
    `Email: ${email}\n` +
    `Temporary password: ${tempPassword}\n\n` +
    `You will be asked to choose your own password when you sign in.`
  );
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── tiny shared components ───────────────────────────────────
function Badge({ children, variant = "gray" }) {
  const styles = {
    green: "bg-green-100 text-green-700 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function ModalShell({ title, subtitle, onClose, children, maxW = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-dark">
          <div>
            <h2 className="font-display font-extrabold text-base" style={{ color: "#0D1117" }}>
              {title}
            </h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-beige hover:text-black transition"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Register / edit modal ────────────────────────────────────
function ShopModal({ shop, onClose, onSaved, onCreated }) {
  const isEdit = Boolean(shop?._id);
  const [form, setForm] = useState(
    isEdit
      ? {
          ownerName: shop.ownerName,
          shopName: shop.shopName,
          phone: shop.phone,
          email: shop.email || "",
          location: shop.location,
          category: [...shop.category],
          offers: [...(shop.offers?.length ? shop.offers : ["sell"])],
          description: shop.description || "",
          verified: shop.verified,
          notes: shop.notes || "",
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.ownerName.trim()) e.ownerName = "Required";
    if (!form.shopName.trim()) e.shopName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.trim()) e.email = "Required — this is their login";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.location.trim()) e.location = "Required";
    if (!form.category.length) e.category = "Select at least one";
    if (!form.offers.length) e.offers = "Select at least one";
    return e;
  };

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const toggleIn = (field, val) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((c) => c !== val) : [...f[field], val],
    }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSaving(true);
    setApiError("");
    try {
      if (isEdit) {
        await updateShopOwner(shop._id, form);
        onSaved();
      } else {
        const { shop: created, tempPassword } = await createShopOwner(form);
        onCreated({ shop: created, tempPassword });
      }
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const chip = (active) =>
    `flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition ${
      active
        ? "bg-black text-white border-black"
        : "bg-beige text-gray-500 border-beige-dark hover:border-gray-400"
    }`;

  return (
    <ModalShell
      title={isEdit ? "Edit shop owner" : "Register shop owner"}
      subtitle={isEdit ? shop.shopName : "They get a login and a dashboard"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        {apiError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Owner name *</label>
            <input value={form.ownerName} onChange={setField("ownerName")} placeholder="John Doe" className={inputCls(errors.ownerName)} />
            {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>}
          </div>
          <div>
            <label className={labelCls}>Shop name *</label>
            <input value={form.shopName} onChange={setField("shopName")} placeholder="TechFix Pro" className={inputCls(errors.shopName)} />
            {errors.shopName && <p className="text-xs text-red-500 mt-1">{errors.shopName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Phone *</label>
            <input value={form.phone} onChange={setField("phone")} placeholder="07XX XXX XXX" className={inputCls(errors.phone)} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className={labelCls}>Email (their login) *</label>
            <input type="email" value={form.email} onChange={setField("email")} placeholder="shop@example.com" className={inputCls(errors.email)} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Location *</label>
          <input value={form.location} onChange={setField("location")} placeholder="Nairobi CBD, Tom Mboya St" className={inputCls(errors.location)} />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>

        <div>
          <label className={labelCls}>What do they do? *</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => toggleIn("offers", "sell")} className={chip(form.offers.includes("sell"))}>
              <ShoppingBag size={15} /> Sell
            </button>
            <button type="button" onClick={() => toggleIn("offers", "repair")} className={chip(form.offers.includes("repair"))}>
              <Wrench size={15} /> Repair
            </button>
          </div>
          {errors.offers && <p className="text-xs text-red-500 mt-1">{errors.offers}</p>}
        </div>

        <div>
          <label className={labelCls}>Which devices? *</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => toggleIn("category", "phone")} className={chip(form.category.includes("phone"))}>
              <Smartphone size={15} /> Phone
            </button>
            <button type="button" onClick={() => toggleIn("category", "laptop")} className={chip(form.category.includes("laptop"))}>
              <Laptop size={15} /> Laptop
            </button>
          </div>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea value={form.description} onChange={setField("description")} rows={2} placeholder="Brief description of the business…" className={`${inputCls()} resize-none`} />
        </div>

        <div>
          <label className={labelCls}>Internal notes</label>
          <textarea value={form.notes} onChange={setField("notes")} rows={2} placeholder="Admin-only notes…" className={`${inputCls()} resize-none`} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.verified}
            onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))}
            className="w-4 h-4 accent-black"
          />
          <span className="text-sm text-gray-700">Mark as verified</span>
        </label>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-beige-dark text-sm font-semibold text-gray-600 hover:bg-beige transition">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-green hover:bg-green-dark text-black text-sm font-bold disabled:opacity-60 transition flex items-center justify-center gap-2">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Register shop"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── One-time credentials modal ───────────────────────────────
function CredentialsModal({ creds, onClose }) {
  const [copied, setCopied] = useState("");
  const message = credentialsMessage(creds);

  const copy = async (what, text) => {
    if (await copyText(text)) {
      setCopied(what);
      setTimeout(() => setCopied(""), 1800);
    }
  };

  const waUrl = `https://wa.me/${waNumber(creds.phone)}?text=${encodeURIComponent(message)}`;

  return (
    <ModalShell
      title={creds.reason === "reset" ? "Password reset" : "Shop registered"}
      subtitle={creds.shopName}
      onClose={onClose}
      maxW="max-w-md"
    >
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            This password is shown once. Send it to the owner now. If you lose it, use Reset password.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CredRow label="Email" value={creds.email} onCopy={() => copy("email", creds.email)} done={copied === "email"} />
          <CredRow label="Temporary password" value={creds.tempPassword} mono onCopy={() => copy("pwd", creds.tempPassword)} done={copied === "pwd"} />
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-green hover:bg-green-dark text-black font-bold text-sm py-3 rounded-xl transition-colors"
        >
          <MessageCircle size={16} /> Send on WhatsApp
        </a>

        <button
          onClick={() => copy("msg", message)}
          className="flex items-center justify-center gap-2 border border-beige-dark hover:border-gray-400 text-sm font-semibold text-gray-600 py-3 rounded-xl transition"
        >
          {copied === "msg" ? <Check size={15} /> : <Copy size={15} />}
          {copied === "msg" ? "Copied" : "Copy full message"}
        </button>

        <button onClick={onClose} className="text-xs text-gray-400 hover:text-black pt-1">
          Done
        </button>
      </div>
    </ModalShell>
  );
}

function CredRow({ label, value, onCopy, done, mono }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-beige border border-beige-dark rounded-xl px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm font-semibold truncate select-all ${mono ? "font-mono tracking-wide" : ""}`} style={{ color: "#0D1117" }}>
          {value}
        </p>
      </div>
      <button onClick={onCopy} className="w-9 h-9 rounded-lg border border-beige-dark bg-white flex items-center justify-center text-gray-500 hover:text-black flex-shrink-0">
        {done ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

// ─── Confirm modal (delete / reset / deactivate) ──────────────
function ConfirmModal({ title, body, confirmLabel, danger, onConfirm, onDone, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await onConfirm();
      if (onDone) onDone(result);
      else onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <h3 className="font-display font-extrabold text-base" style={{ color: "#0D1117" }}>{title}</h3>
        <p className="text-sm text-gray-500 mt-2 mb-5">{body}</p>
        {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-beige-dark text-sm font-semibold text-gray-600 hover:bg-beige transition">
            Cancel
          </button>
          <button
            onClick={run}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-60 transition flex items-center justify-center gap-2 ${
              danger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-black text-white"
            }`}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────
function ShopRow({ shop, onEdit, onDelete, onReset, onToggle, onError, onAskDeactivate }) {
  const [togglingV, setTogglingV] = useState(false);
  const [togglingA, setTogglingA] = useState(false);

  const handleToggleVerified = async () => {
    setTogglingV(true);
    try {
      onToggle(await toggleVerified(shop._id));
    } catch (e) {
      onError(e.message);
    } finally {
      setTogglingV(false);
    }
  };

  const doToggleActive = async () => {
    setTogglingA(true);
    try {
      onToggle(await toggleActive(shop._id));
    } catch (e) {
      onError(e.message);
    } finally {
      setTogglingA(false);
    }
  };

  const handleToggleActive = () => (shop.active ? onAskDeactivate(shop, doToggleActive) : doToggleActive());

  const actionBtn = "w-9 h-9 rounded-xl border flex items-center justify-center transition-colors";

  return (
    <tr className="border-b border-beige-dark last:border-0 hover:bg-beige/50 transition">
      <td className="px-5 py-4">
        <p className="font-semibold text-sm leading-tight" style={{ color: "#0D1117" }}>{shop.shopName}</p>
        <p className="text-xs text-gray-400 mt-0.5">{shop.ownerName}</p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm text-gray-700">{shop.phone}</p>
        {shop.email && <p className="text-xs text-gray-400 truncate max-w-[170px]">{shop.email}</p>}
      </td>

      <td className="px-4 py-4"><span className="text-sm text-gray-600">{shop.location}</span></td>

      <td className="px-4 py-4">
        <div className="flex gap-1.5 flex-wrap">
          {(shop.offers?.length ? shop.offers : ["sell"]).map((o) => (
            <Badge key={o} variant="amber">{o === "repair" ? "Repairs" : "Sells"}</Badge>
          ))}
          {shop.category.map((cat) => (
            <Badge key={cat} variant="blue">
              {cat === "phone" ? <Smartphone size={11} /> : <Laptop size={11} />} {cat}
            </Badge>
          ))}
        </div>
      </td>

      <td className="px-4 py-4">
        <button onClick={handleToggleVerified} disabled={togglingV} className="disabled:opacity-50" title="Click to toggle">
          {shop.verified ? (
            <Badge variant="green"><ShieldCheck size={11} /> Verified</Badge>
          ) : (
            <Badge>Unverified</Badge>
          )}
        </button>
      </td>

      <td className="px-4 py-4">
        <button onClick={handleToggleActive} disabled={togglingA} className="disabled:opacity-50" title="Click to toggle">
          {shop.active ? <Badge variant="green">Active</Badge> : <Badge variant="red">Inactive</Badge>}
        </button>
      </td>

      <td className="px-4 py-4">
        <div className="flex gap-2">
          <button onClick={() => onReset(shop)} title="Reset password" className={`${actionBtn} border-beige-dark text-gray-500 hover:border-gray-400 hover:text-black`}>
            <KeyRound size={15} />
          </button>
          <button onClick={() => onEdit(shop)} title="Edit" className={`${actionBtn} border-beige-dark text-gray-500 hover:border-gray-400 hover:text-black`}>
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(shop)} title="Delete" className={`${actionBtn} border-red-200 text-red-500 hover:bg-red-50`}>
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function ShopOwners() {
  const [shops, setShops] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "", category: "", offers: "", verified: "", active: "", page: 1, limit: 20,
  });

  // modal: null | {type:"create"} | {type:"edit",shop} | {type:"delete",shop} | {type:"reset",shop}
  //      | {type:"deactivate",shop,run} | {type:"creds",creds}
  const [modal, setModal] = useState(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllShopOwners(filters);
      setShops(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleToggle = (updated) =>
    setShops((prev) => prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s)));

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value, page: 1 }));
  const totalPages = Math.ceil(total / filters.limit);

  const selectCls =
    "bg-beige border border-beige-dark rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none cursor-pointer focus:border-green";

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-gray-400 text-sm">
          {total} shop{total !== 1 ? "s" : ""} registered
        </p>
        <button
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} /> Register Shop
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-beige-dark rounded-2xl p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative col-span-2 lg:col-span-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={setFilter("search")}
            placeholder="Search name, owner, location…"
            className="w-full bg-beige border border-beige-dark rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green placeholder:text-gray-400"
          />
        </div>
        <select value={filters.offers} onChange={setFilter("offers")} className={selectCls}>
          <option value="">Sells or repairs</option>
          <option value="sell">Sells</option>
          <option value="repair">Repairs</option>
        </select>
        <select value={filters.category} onChange={setFilter("category")} className={selectCls}>
          <option value="">All devices</option>
          <option value="phone">Phone</option>
          <option value="laptop">Laptop</option>
        </select>
        <select value={filters.verified} onChange={setFilter("verified")} className={selectCls}>
          <option value="">All (verified)</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <select value={filters.active} onChange={setFilter("active")} className={selectCls}>
          <option value="">All (status)</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-100 text-sm text-red-600 flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => setError("")} className="underline font-medium hover:no-underline">Dismiss</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-beige-dark bg-beige/60">
                {["Shop", "Contact", "Location", "Offers", "Verified", "Status", ""].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide ${i === 0 ? "px-5" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                    No shops found.{" "}
                    <button onClick={() => setModal({ type: "create" })} className="text-black font-semibold underline">
                      Register one
                    </button>
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <ShopRow
                    key={shop._id}
                    shop={shop}
                    onEdit={(s) => setModal({ type: "edit", shop: s })}
                    onDelete={(s) => setModal({ type: "delete", shop: s })}
                    onReset={(s) => setModal({ type: "reset", shop: s })}
                    onAskDeactivate={(s, run) => setModal({ type: "deactivate", shop: s, run })}
                    onToggle={handleToggle}
                    onError={setError}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-beige-dark">
            <p className="text-xs text-gray-400">Page {filters.page} of {totalPages} · {total} total</p>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} className="px-3 py-1.5 rounded-lg border border-beige-dark text-xs font-semibold text-gray-600 hover:bg-beige disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← Prev
              </button>
              <button disabled={filters.page >= totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} className="px-3 py-1.5 rounded-lg border border-beige-dark text-xs font-semibold text-gray-600 hover:bg-beige disabled:opacity-40 disabled:cursor-not-allowed transition">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal?.type === "create" || modal?.type === "edit") && (
        <ShopModal
          shop={modal.type === "edit" ? modal.shop : null}
          onClose={() => setModal(null)}
          onSaved={fetchShops}
          onCreated={({ shop, tempPassword }) => {
            fetchShops();
            // replace the form modal with the one-time credentials screen
            setModal({
              type: "creds",
              creds: {
                reason: "created",
                shopName: shop.shopName,
                ownerName: shop.ownerName,
                phone: shop.phone,
                email: shop.email,
                tempPassword,
              },
            });
          }}
        />
      )}

      {modal?.type === "creds" && <CredentialsModal creds={modal.creds} onClose={() => setModal(null)} />}

      {modal?.type === "reset" && (
        <ConfirmModal
          title="Reset password?"
          body={`${modal.shop.shopName}'s old password will stop working and they must set a new one when they next sign in. You'll get a temporary password to send them.`}
          confirmLabel="Reset"
          onClose={() => setModal(null)}
          onConfirm={() => resetShopPassword(modal.shop._id)}
          onDone={({ tempPassword }) => {
            const s = modal.shop;
            setModal({
              type: "creds",
              creds: {
                reason: "reset",
                shopName: s.shopName,
                ownerName: s.ownerName,
                phone: s.phone,
                email: s.email,
                tempPassword,
              },
            });
          }}
        />
      )}

      {modal?.type === "deactivate" && (
        <ConfirmModal
          title="Deactivate shop?"
          body={`${modal.shop.shopName} will be blocked from signing in and all their listings will be hidden. Reactivating does not republish the listings.`}
          confirmLabel="Deactivate"
          danger
          onClose={() => setModal(null)}
          onConfirm={() => modal.run()}
        />
      )}

      {modal?.type === "delete" && (
        <ConfirmModal
          title="Delete shop owner?"
          body={`${modal.shop.shopName} will be permanently removed. Shops with listings can't be deleted — deactivate them instead.`}
          confirmLabel="Delete"
          danger
          onClose={() => setModal(null)}
          onConfirm={async () => {
            await deleteShopOwner(modal.shop._id);
            fetchShops();
          }}
        />
      )}
    </div>
  );
}