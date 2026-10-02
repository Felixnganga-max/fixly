import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff, Loader2,
  Smartphone, Laptop, AlertTriangle,
} from "lucide-react";
import { getMyListings } from "../Hooks/shopApi";
import { toggleListingActive, deleteListing } from "../Hooks/marketplaceApi";
import { addListingPath, editListingPath } from "../Hooks/listingsBase";
import { getUser } from "../Hooks/loginApi";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "hidden", label: "Hidden" },
];

export default function ShopListings() {
  const navigate = useNavigate();
  const canSell = getUser()?.offers?.includes("sell") ?? true;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const load = () =>
    getMyListings({ limit: 100 })
      .then((r) => setRows(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((l) => {
      if (filter === "live" && !l.active) return false;
      if (filter === "hidden" && l.active) return false;
      if (!term) return true;
      return `${l.brand} ${l.name}`.toLowerCase().includes(term);
    });
  }, [rows, filter, q]);

  const toggle = async (l) => {
    setBusy(l._id);
    setError("");
    try {
      const updated = await toggleListingActive(l._id);
      setRows((p) => p.map((r) => (r._id === l._id ? { ...r, active: updated.active } : r)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (l) => {
    if (!window.confirm(`Delete "${l.brand} ${l.name}"? This cannot be undone.`)) return;
    setBusy(l._id);
    setError("");
    try {
      await deleteListing(l._id);
      setRows((p) => p.filter((r) => r._id !== l._id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (!canSell) {
    return (
      <div className="bg-white border border-beige-dark rounded-2xl p-6 max-w-xl">
        <p className="text-sm text-gray-600">
          Your shop is not set up to sell devices. Contact Fixly to change this.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-gray-400 text-sm">
          {rows.length} listing{rows.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => navigate(addListingPath())}
          className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} /> Add listing
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-beige-dark rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or brand…"
            className="w-full bg-beige border border-beige-dark rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                filter === f.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-beige-dark rounded-2xl p-10 text-center">
          <p className="text-gray-500 text-sm">
            {rows.length === 0
              ? "No listings yet. Add your first device."
              : "No listings match your filters."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((l) => {
            const Icon = l.category === "laptop" ? Laptop : Smartphone;
            const working = busy === l._id;
            return (
              <div
                key={l._id}
                className="bg-white border border-beige-dark rounded-2xl p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
              >
                <div className="w-16 h-16 rounded-xl bg-beige border border-beige-dark overflow-hidden flex items-center justify-center flex-shrink-0">
                  {l.images?.[0] ? (
                    <img src={l.images[0]} alt={l.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon size={22} className="text-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "#0D1117" }}>
                    {l.brand} {l.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {l.condition} · {l.views || 0} views
                  </p>
                  <p className="text-sm font-semibold tabular-nums mt-1" style={{ color: "#0D1117" }}>
                    {Number(l.price) > 0 ? `KES ${Number(l.price).toLocaleString()}` : "No price set"}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 ${
                    l.active
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {l.active ? "Live" : "Hidden"}
                </span>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {working ? (
                    <Loader2 size={16} className="animate-spin text-gray-400 mx-3" />
                  ) : (
                    <>
                      <IconBtn title={l.active ? "Hide" : "Publish"} onClick={() => toggle(l)}>
                        {l.active ? <EyeOff size={15} /> : <Eye size={15} />}
                      </IconBtn>
                      <IconBtn title="Edit" onClick={() => navigate(editListingPath(l._id))}>
                        <Pencil size={15} />
                      </IconBtn>
                      <IconBtn title="Delete" danger onClick={() => remove(l)}>
                        <Trash2 size={15} />
                      </IconBtn>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
        danger
          ? "border-red-200 text-red-500 hover:bg-red-50"
          : "border-beige-dark text-gray-500 hover:border-gray-400 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}