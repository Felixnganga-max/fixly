import { useState, useEffect, useCallback } from "react";
import {
  getAllShopOwners,
  createShopOwner,
  updateShopOwner,
  toggleVerified,
  toggleActive,
  deleteShopOwner,
} from "../Hooks/shopOwners";

// ─── constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  ownerName: "",
  shopName: "",
  phone: "",
  email: "",
  location: "",
  category: [],
  description: "",
  verified: false,
  notes: "",
};

// ─── tiny shared components ───────────────────────────────────────────────────
function Badge({ children, variant = "gray" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    red: "bg-red-50 text-red-600 border border-red-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    gray: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function Spinner({ size = "md" }) {
  const s = size === "sm" ? "w-4 h-4 border-2" : "w-8 h-8 border-4";
  return (
    <div
      className={`${s} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
    />
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function ShopModal({ shop, onClose, onSaved }) {
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
    if (!form.location.trim()) e.location = "Required";
    if (!form.category.length) e.category = "Select at least one";
    return e;
  };

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleCat = (cat) =>
    setForm((f) => ({
      ...f,
      category: f.category.includes(cat)
        ? f.category.filter((c) => c !== cat)
        : [...f.category, cat],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setSaving(true);
    setApiError("");
    try {
      if (isEdit) {
        await updateShopOwner(shop._id, form);
      } else {
        await createShopOwner(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Shop Owner" : "Register Shop Owner"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? shop.shopName : "Fill in the details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition text-lg"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Owner Name *
              </label>
              <input
                value={form.ownerName}
                onChange={setField("ownerName")}
                placeholder="John Doe"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  errors.ownerName ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.ownerName && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.ownerName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Shop Name *
              </label>
              <input
                value={form.shopName}
                onChange={setField("shopName")}
                placeholder="TechFix Pro"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  errors.shopName ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.shopName && (
                <p className="text-xs text-red-500 mt-0.5">{errors.shopName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Phone *
              </label>
              <input
                value={form.phone}
                onChange={setField("phone")}
                placeholder="+254 7xx xxx xxx"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  errors.phone ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                placeholder="shop@example.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Location *
            </label>
            <input
              value={form.location}
              onChange={setField("location")}
              placeholder="Nairobi CBD, Tom Mboya St"
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                errors.location ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.location && (
              <p className="text-xs text-red-500 mt-0.5">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Category *
            </label>
            <div className="flex gap-3">
              {["phone", "laptop"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition ${
                    form.category.includes(cat)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {cat === "phone" ? "📱 Phone" : "💻 Laptop"}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-red-500 mt-0.5">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={setField("description")}
              rows={2}
              placeholder="Brief description of services offered..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Internal Notes
            </label>
            <textarea
              value={form.notes}
              onChange={setField("notes")}
              rows={2}
              placeholder="Admin-only notes..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) =>
                setForm((f) => ({ ...f, verified: e.target.checked }))
              }
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-700">Mark as verified</span>
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {saving && <Spinner size="sm" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Register Shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ shop, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteShopOwner(shop._id);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">🗑️</span>
        </div>
        <h3 className="text-base font-bold text-gray-900">
          Delete Shop Owner?
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          <span className="font-semibold text-gray-700">{shop.shopName}</span>{" "}
          will be permanently removed. This cannot be undone.
        </p>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {loading && <Spinner size="sm" />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────
function ShopRow({ shop, onEdit, onDelete, onToggle }) {
  const [togglingV, setTogglingV] = useState(false);
  const [togglingA, setTogglingA] = useState(false);

  const handleToggleVerified = async () => {
    setTogglingV(true);
    try {
      const updated = await toggleVerified(shop._id);
      onToggle(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingV(false);
    }
  };

  const handleToggleActive = async () => {
    setTogglingA(true);
    try {
      const updated = await toggleActive(shop._id);
      onToggle(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingA(false);
    }
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/70 transition group">
      <td className="px-5 py-3.5">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {shop.shopName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{shop.ownerName}</p>
      </td>

      <td className="px-4 py-3.5">
        <p className="text-sm text-gray-700">{shop.phone}</p>
        {shop.email && (
          <p className="text-xs text-gray-400 truncate max-w-[150px]">
            {shop.email}
          </p>
        )}
      </td>

      <td className="px-4 py-3.5">
        <span className="text-sm text-gray-600">{shop.location}</span>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex gap-1 flex-wrap">
          {shop.category.map((cat) => (
            <Badge key={cat} variant="blue">
              {cat === "phone" ? "📱" : "💻"} {cat}
            </Badge>
          ))}
        </div>
      </td>

      <td className="px-4 py-3.5">
        <button
          onClick={handleToggleVerified}
          disabled={togglingV}
          className="disabled:opacity-50 transition"
          title="Click to toggle"
        >
          {shop.verified ? (
            <Badge variant="green">✓ Verified</Badge>
          ) : (
            <Badge variant="gray">Unverified</Badge>
          )}
        </button>
      </td>

      <td className="px-4 py-3.5">
        <button
          onClick={handleToggleActive}
          disabled={togglingA}
          className="disabled:opacity-50 transition"
          title="Click to toggle"
        >
          {shop.active ? (
            <Badge variant="green">Active</Badge>
          ) : (
            <Badge variant="red">Inactive</Badge>
          )}
        </button>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(shop)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(shop)}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ShopOwners() {
  const [shops, setShops] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    verified: "",
    active: "",
    page: 1,
    limit: 20,
  });

  // modal state: null | { type: "create" | "edit" | "delete", shop?: {} }
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

  // optimistic toggle update
  const handleToggle = (updated) => {
    setShops((prev) =>
      prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s)),
    );
  };

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value, page: 1 }));

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Owners</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} shop{total !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={() => setModal({ type: "create" })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <span className="text-base leading-none">+</span> Register Shop
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              value={filters.search}
              onChange={setFilter("search")}
              placeholder="Search name, owner, location…"
              className="col-span-2 sm:col-span-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <select
              value={filters.category}
              onChange={setFilter("category")}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="">All categories</option>
              <option value="phone">📱 Phone</option>
              <option value="laptop">💻 Laptop</option>
            </select>
            <select
              value={filters.verified}
              onChange={setFilter("verified")}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="">All (verified)</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
            <select
              value={filters.active}
              onChange={setFilter("active")}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            >
              <option value="">All (status)</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 text-sm text-red-600">
              {error}{" "}
              <button
                onClick={fetchShops}
                className="underline font-medium hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {[
                    "Shop",
                    "Contact",
                    "Location",
                    "Category",
                    "Verified",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide first:px-5"
                    >
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
                        <Spinner />
                      </div>
                    </td>
                  </tr>
                ) : shops.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-sm text-gray-400"
                    >
                      No shops found.{" "}
                      <button
                        onClick={() => setModal({ type: "create" })}
                        className="text-indigo-600 font-medium hover:underline"
                      >
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
                      onToggle={handleToggle}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Page {filters.page} of {totalPages} · {total} total
              </p>
              <div className="flex gap-2">
                <button
                  disabled={filters.page <= 1}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: f.page - 1 }))
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: f.page + 1 }))
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {modal?.type === "create" && (
        <ShopModal
          shop={null}
          onClose={() => setModal(null)}
          onSaved={fetchShops}
        />
      )}
      {modal?.type === "edit" && (
        <ShopModal
          shop={modal.shop}
          onClose={() => setModal(null)}
          onSaved={fetchShops}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteConfirm
          shop={modal.shop}
          onClose={() => setModal(null)}
          onDeleted={fetchShops}
        />
      )}
    </div>
  );
}
