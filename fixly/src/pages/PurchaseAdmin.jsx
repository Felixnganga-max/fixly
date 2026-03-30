import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  Phone,
  PhoneOff,
  ShoppingBag,
  Loader2,
  AlertTriangle,
  StickyNote,
  Mail,
  MapPin,
  Truck,
  Store,
  HelpCircle,
  Calendar,
  Tag,
  Building2,
  UserCheck,
  XCircle,
  ChevronDown,
} from "lucide-react";
import {
  getAllPurchaseRequests,
  updatePurchaseRequest,
  deletePurchaseRequest,
  assignShopToPurchaseRequest,
  unassignShopFromPurchaseRequest,
} from "../Hooks/purchaseApi";
import { getAllShopOwners } from "../Hooks/shopOwners";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  pending: {
    label: "Pending",
    icon: Clock,
    pill: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  contacted: {
    label: "Contacted",
    icon: Phone,
    pill: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    pill: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: PhoneOff,
    pill: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
};

const DELIVERY_META = {
  delivery: { label: "Delivery", icon: Truck },
  pickup: { label: "Pick-up", icon: Store },
  undecided: { label: "Undecided", icon: HelpCircle },
};

const STATUS_FLOW = ["pending", "contacted", "completed", "cancelled"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtPrice(n) {
  return `KES ${Number(n).toLocaleString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${m.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function DeliveryBadge({ method }) {
  const m = DELIVERY_META[method] || DELIVERY_META.undecided;
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <Icon size={12} className="text-gray-400" />
      {m.label}
    </span>
  );
}

// ─── Shop Picker ──────────────────────────────────────────────────────────────

function ShopPicker({ currentShop, requestId, onAssigned, onUnassigned }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [error, setError] = useState("");
  const dropRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Fetch shops when dropdown opens or query changes
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoadingShops(true);
      try {
        const res = await getAllShopOwners({
          search: query || undefined,
          active: true,
          limit: 20,
        });
        setShops(res.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingShops(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [open, query]);

  const handleAssign = async (shop) => {
    setAssigning(true);
    setError("");
    try {
      const res = await assignShopToPurchaseRequest(requestId, shop._id);
      onAssigned(res.data ?? res);
      setOpen(false);
      setQuery("");
    } catch (e) {
      setError(e.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    setUnassigning(true);
    setError("");
    try {
      const res = await unassignShopFromPurchaseRequest(requestId);
      onUnassigned(res.data ?? res);
    } catch (e) {
      setError(e.message);
    } finally {
      setUnassigning(false);
    }
  };

  return (
    <div className="mx-6 mt-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Building2 size={12} />
        Assigned Shop
      </p>

      {/* Currently assigned */}
      {currentShop ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <UserCheck size={15} className="text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentShop.shopName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentShop.ownerName} · {currentShop.phone}
              </p>
            </div>
          </div>
          <button
            onClick={handleUnassign}
            disabled={unassigning}
            title="Remove assignment"
            className="ml-2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {unassigning ? (
              <Loader2 size={13} className="animate-spin text-gray-400" />
            ) : (
              <XCircle size={15} className="text-gray-400 hover:text-red-500" />
            )}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-2">
          No shop assigned yet
        </p>
      )}

      {/* Assign / change button */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={assigning}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <span className="flex items-center gap-2">
            <Store size={14} />
            {currentShop ? "Change shop…" : "Assign a shop…"}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-10 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shops…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto">
              {loadingShops ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                </div>
              ) : shops.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-6">
                  No active shops found
                </p>
              ) : (
                shops.map((shop) => {
                  const isCurrentlyAssigned =
                    currentShop?._id === shop._id || currentShop === shop._id;
                  return (
                    <button
                      key={shop._id}
                      onClick={() => handleAssign(shop)}
                      disabled={assigning || isCurrentlyAssigned}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors disabled:opacity-50 border-b border-gray-50 last:border-0 ${
                        isCurrentlyAssigned ? "bg-indigo-50" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Store size={14} className="text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                          {shop.shopName}
                          {isCurrentlyAssigned && (
                            <CheckCircle2
                              size={12}
                              className="text-indigo-500 flex-shrink-0"
                            />
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {shop.ownerName} · {shop.location}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {shop.category?.map((cat) => (
                          <span
                            key={cat}
                            className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100"
                          >
                            {cat === "phone" ? "📱" : "💻"}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function RequestDrawer({ request, onClose, onUpdated, onDeleted }) {
  const [status, setStatus] = useState(request.status);
  const [notes, setNotes] = useState(request.notes || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  // local copy of assignedShop so ShopPicker updates reflect immediately
  const [assignedShop, setAssignedShop] = useState(
    request.assignedShop || null,
  );

  const isDirty = status !== request.status || notes !== (request.notes || "");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updatePurchaseRequest(request._id, {
        status,
        notes,
      });
      onUpdated(updated.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePurchaseRequest(request._id);
      onDeleted(request._id);
      onClose();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  // When shop is assigned/unassigned, bubble update up to table row too
  const handleShopAssigned = (updatedRequest) => {
    setAssignedShop(updatedRequest.assignedShop || null);
    // also sync status if backend auto-advanced it
    if (updatedRequest.status) setStatus(updatedRequest.status);
    onUpdated(updatedRequest);
  };

  const handleShopUnassigned = (updatedRequest) => {
    setAssignedShop(null);
    onUpdated(updatedRequest);
  };

  const snap = request.listingSnapshot || {};

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-base text-gray-900">
              Purchase Request
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              #{request._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Listing snapshot */}
          <div className="mx-6 mt-5 flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
            {snap.image ? (
              <img
                src={snap.image}
                alt={snap.name}
                className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={20} className="text-gray-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-gray-400 text-xs uppercase tracking-wide">
                {snap.brand}
              </p>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {snap.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-sm text-gray-900">
                  {snap.price ? fmtPrice(snap.price) : "—"}
                </span>
                {snap.condition && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {snap.condition}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buyer info */}
          <div className="mx-6 mt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Buyer Details
            </p>
            <div className="space-y-2.5">
              {[
                { icon: Tag, label: "Name", value: request.firstName },
                { icon: Mail, label: "Email", value: request.email },
                { icon: Phone, label: "Phone", value: request.phone },
                { icon: MapPin, label: "Address", value: request.address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={13} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm text-gray-900 font-medium">{value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck size={13} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Delivery Preference</p>
                  <DeliveryBadge method={request.deliveryMethod} />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar size={13} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {fmt(request.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Shop Assignment ── */}
          <ShopPicker
            currentShop={assignedShop}
            requestId={request._id}
            onAssigned={handleShopAssigned}
            onUnassigned={handleShopUnassigned}
          />

          {/* Status */}
          <div className="mx-6 mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Status
            </p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_FLOW.map((s) => {
                const m = STATUS_META[s];
                const Icon = m.icon;
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                      active
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    <Icon size={14} strokeWidth={2} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mx-6 mt-6 mb-6">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <StickyNote size={12} className="text-gray-400" />
              Admin Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex-1 bg-gray-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-12 h-12 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-colors"
              >
                <Trash2
                  size={16}
                  className="text-gray-400 hover:text-red-500"
                />
              </button>
            ) : (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 h-12 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <AlertTriangle size={14} /> Confirm
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PurchaseAdmin() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllPurchaseRequests({
        status: statusFilter || undefined,
        page,
        limit: LIMIT,
        sortBy: "createdAt",
        order: "desc",
      });
      setRequests(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search.trim()
    ? requests.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.firstName?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.phone?.includes(q) ||
          r.listingSnapshot?.name?.toLowerCase().includes(q)
        );
      })
    : requests;

  const handleUpdated = (updated) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === updated._id ? updated : r)),
    );
    setSelected(updated);
  };

  const handleDeleted = (id) => {
    setRequests((prev) => prev.filter((r) => r._id !== id));
    setTotal((t) => t - 1);
  };

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {selected && (
        <RequestDrawer
          request={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Purchase Requests
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total} total request{total !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
              strokeWidth={2}
            />
            Refresh
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: "", label: "All" },
            ...STATUS_FLOW.map((s) => ({
              value: s,
              label: STATUS_META[s].label,
            })),
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setStatusFilter(value);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                statusFilter === value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {label}
              {value && counts[value] !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    statusFilter === value
                      ? "bg-white/20 text-white"
                      : STATUS_META[value].pill
                  }`}
                >
                  {counts[value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={15} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <ShoppingBag size={32} strokeWidth={1.5} />
              <p className="text-sm">No purchase requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Product",
                      "Buyer",
                      "Contact",
                      "Assigned Shop",
                      "Delivery",
                      "Status",
                      "Date",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => {
                    const snap = r.listingSnapshot || {};
                    const shop = r.assignedShop;
                    return (
                      <tr
                        key={r._id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => setSelected(r)}
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {snap.image ? (
                              <img
                                src={snap.image}
                                alt={snap.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <ShoppingBag
                                  size={16}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-[160px]">
                                {snap.name || "—"}
                              </p>
                              <p className="text-gray-400 text-xs font-mono">
                                {snap.price ? fmtPrice(snap.price) : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Buyer */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {r.firstName}
                          </p>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <p className="text-gray-600">{r.email}</p>
                          <p className="text-gray-400 text-xs">{r.phone}</p>
                        </td>

                        {/* Assigned shop */}
                        <td className="px-5 py-4">
                          {shop ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <UserCheck
                                  size={11}
                                  className="text-emerald-600"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate max-w-[110px]">
                                  {shop.shopName}
                                </p>
                                <p className="text-xs text-gray-400 truncate max-w-[110px]">
                                  {shop.ownerName}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Delivery */}
                        <td className="px-5 py-4">
                          <DeliveryBadge method={r.deliveryMethod} />
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={r.status} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {fmt(r.createdAt)}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <span className="text-xs text-gray-400 group-hover:text-gray-900 font-semibold transition-colors">
                            View →
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-sm text-gray-400">
              Page {page} of {pages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
