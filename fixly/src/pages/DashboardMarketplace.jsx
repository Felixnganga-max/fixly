import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Package,
  Star,
  RefreshCw,
} from "lucide-react";
import {
  getAllListings,
  updateListing,
  toggleListingActive,
  deleteListing,
  getMarketplaceStats,
} from "../Hooks/marketplaceApi";

const CONDITIONS = ["New", "Used", "Refurbished"];

const conditionStyle = {
  New: "bg-green-light text-green border-green-dark/30",
  Used: "bg-amber-100 text-amber-700 border-amber-300",
  Refurbished: "bg-blue-100 text-blue-700 border-blue-300",
};

// ── Reusable stat card ────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-gray-500",
  loading,
}) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl px-6 py-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
        <Icon size={18} className={color} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        {loading ? (
          <div className="h-7 w-12 bg-beige-dark rounded animate-pulse mt-1" />
        ) : (
          <p
            className="font-display font-extrabold text-2xl text-black mt-0.5"
            style={{ color: "#0D1117" }}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────
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

// ── Product table row ─────────────────────────────────────────
function ProductRow({
  product,
  onEdit,
  onToggleActive,
  onToggleVerified,
  onDelete,
  busy,
}) {
  const DevIcon = product.category === "phone" ? Smartphone : Laptop;
  const img = product.images?.[0] || "";

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
            {product.views > 0 && (
              <p className="text-gray-300 text-xs">{product.views} views</p>
            )}
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
          onClick={() => onToggleVerified(product._id)}
          disabled={busy === product._id + "_v"}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 disabled:opacity-50 ${product.verified ? "bg-green-light text-green border-green-dark/30" : "bg-beige text-gray-400 border-beige-dark hover:border-gray-300"}`}
        >
          {busy === product._id + "_v" ? (
            <Loader2 size={11} className="animate-spin" />
          ) : product.verified ? (
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
          onClick={() => onToggleActive(product._id)}
          disabled={busy === product._id + "_a"}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 disabled:opacity-50 ${product.active ? "bg-black text-white border-black" : "bg-beige text-gray-400 border-beige-dark"}`}
        >
          {busy === product._id + "_a" ? (
            <Loader2 size={11} className="animate-spin" />
          ) : product.active ? (
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
            onClick={() => onDelete(product._id)}
            className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} className="text-gray-400" strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main dashboard ────────────────────────────────────────────
export default function DashboardMarketplace() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoad, setStatsLoad] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [condFilter, setCondFilter] = useState("All");
  const [verFilter, setVerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [phonesRes, laptopsRes] = await Promise.all([
        getAllListings({ category: "phone", all: "true", limit: 200 }),
        getAllListings({ category: "laptop", all: "true", limit: 200 }),
      ]);
      setProducts([...phonesRes.data, ...laptopsRes.data]);
    } catch (err) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoad(true);
    try {
      const s = await getMarketplaceStats();
      setStats(s);
    } catch {
      /* non-critical */
    } finally {
      setStatsLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchStats();
  }, [fetchAll, fetchStats]);

  // ── Filtered + sorted list ──────────────────────────────────
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
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return a.name.localeCompare(b.name);
    });
  }, [products, search, catFilter, condFilter, verFilter, sortBy]);

  // ── Handlers ────────────────────────────────────────────────
  const handleToggleActive = async (id) => {
    setBusy(id + "_a");
    try {
      const updated = await toggleListingActive(id);
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      fetchStats();
    } catch {
      /* silent */
    } finally {
      setBusy(null);
    }
  };

  const handleToggleVerified = async (id) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;
    setBusy(id + "_v");
    try {
      const updated = await updateListing(id, { verified: !product.verified });
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      fetchStats();
    } catch {
      /* silent */
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteListing(deleteId);
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      fetchStats();
    } catch {
      /* silent */
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (product) => {
    // Navigate to edit page, pass product id
    navigate(`/dashboard/marketplace/edit/${product._id}`);
  };

  const filterBtn = (active) =>
    `px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-150 whitespace-nowrap ${active ? "bg-black text-white border-black" : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"}`;

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
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchAll();
              fetchStats();
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-beige-dark hover:border-gray-400 text-gray-500 hover:text-black text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {/* ── Navigate to full Add Listing page ── */}
          <button
            onClick={() => navigate("/dashboard/marketplace/add")}
            className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors duration-200"
          >
            <Plus size={16} strokeWidth={2.5} /> Add Listing
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total listings"
          value={stats?.total ?? "—"}
          icon={Package}
          loading={statsLoad}
        />
        <StatCard
          label="Live on site"
          value={stats?.active ?? "—"}
          icon={Eye}
          loading={statsLoad}
          color="text-green"
        />
        <StatCard
          label="Verified"
          value={stats?.verified ?? "—"}
          icon={ShieldCheck}
          loading={statsLoad}
          color="text-blue-500"
        />
        <StatCard
          label="Phones"
          value={stats?.phones ?? "—"}
          icon={Smartphone}
          loading={statsLoad}
          color="text-amber-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

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
            placeholder="Search name or brand…"
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
          {CONDITIONS.map((c) => (
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
          <option value="newest">Sort: Newest</option>
        </select>
      </div>

      <p className="text-gray-400 text-sm -mt-2">
        {loading
          ? "Loading…"
          : `${displayed.length} listing${displayed.length !== 1 ? "s" : ""} shown`}
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-gray-400 mx-auto"
                    />
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
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
                    key={p._id}
                    product={p}
                    busy={busy}
                    onEdit={handleEdit}
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
                This will permanently remove the listing and all its images.
                This cannot be undone.
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
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
