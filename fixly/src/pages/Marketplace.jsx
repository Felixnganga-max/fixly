import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Search,
  Star,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllListings } from "../Hooks/marketplaceApi"; // adjust path

// ── Constants ─────────────────────────────────────────────────
const PHONE_BRANDS = ["All", "Apple", "Samsung", "Xiaomi", "Tecno", "Infinix"];
const LAPTOP_BRANDS = ["All", "HP", "Lenovo", "Dell", "Asus", "Apple"];
const CONDITIONS = ["All", "New", "Used", "Refurbished"];
const PRICE_RANGES = [
  { label: "All prices", min: null, max: null },
  { label: "Under 50K", min: null, max: 50000 },
  { label: "50K–100K", min: 50000, max: 100000 },
  { label: "100K–200K", min: 100000, max: 200000 },
  { label: "200K+", min: 200000, max: null },
];

// ── useDragScroll ─────────────────────────────────────────────
function useDragScroll() {
  const ref = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e) => {
    dragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  }, []);
  const onMouseUp = useCallback(() => {
    dragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.userSelect = "";
    }
  }, []);
  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);
  const onMouseLeave = useCallback(() => {
    dragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.userSelect = "";
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [onMouseDown, onMouseUp, onMouseMove, onMouseLeave]);

  return ref;
}

// ── Condition styles ──────────────────────────────────────────
const conditionStyle = {
  New: "bg-green-light text-green border-green-dark/30",
  Used: "bg-amber-100 text-amber-700 border-amber-300",
  Refurbished: "bg-blue-100 text-blue-700 border-blue-300",
};

// ── ProductCard ───────────────────────────────────────────────
function ProductCard({ product }) {
  const navigate = useNavigate();
  // Support both mock shape (id) and API shape (_id)
  const pid = product._id || product.id;

  return (
    <div className="group bg-white border border-beige-dark rounded-2xl overflow-hidden hover:border-green hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative w-full h-44 bg-beige overflow-hidden flex-shrink-0">
        <img
          src={
            product.images?.[0] ||
            product.image ||
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80"
          }
          alt={product.name}
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";
          }}
        />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${conditionStyle[product.condition]}`}
        >
          {product.condition}
        </span>
        {product.verified && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-black text-green">
            <ShieldCheck size={10} strokeWidth={2.5} /> Verified
          </span>
        )}
        {product.discount && (
          <span className="absolute bottom-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
            -{product.discount}%
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
          {product.brand}
        </p>
        <h3
          className="font-display font-bold text-black text-sm leading-tight"
          style={{ color: "#0D1117" }}
        >
          {product.name}
        </h3>
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={10}
                className={
                  i <= Math.round(product.rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200 fill-gray-200"
                }
              />
            ))}
            <span className="text-gray-400 text-xs ml-1">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <p
            className="font-mono font-extrabold text-lg text-black"
            style={{ color: "#0D1117" }}
          >
            KES {product.price.toLocaleString()}
          </p>
          {product.oldPrice && (
            <p className="font-mono text-xs text-gray-400 line-through">
              KES {product.oldPrice.toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate(`/product/${pid}`)}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-black hover:bg-green text-white hover:text-black font-semibold text-xs py-2.5 rounded-xl transition-all duration-200"
        >
          View Details <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ── FeaturedCard ──────────────────────────────────────────────
function FeaturedCard({ product }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;

  return (
    <div
      onClick={() => navigate(`/product/${pid}`)}
      className="group relative flex-shrink-0 w-56 sm:w-64 rounded-2xl overflow-hidden border border-beige-dark hover:border-green transition-all duration-300 hover:-translate-y-1 bg-white select-none cursor-pointer"
    >
      <div className="w-full h-40 overflow-hidden bg-beige">
        <img
          src={product.images?.[0] || product.image || ""}
          alt={product.name}
          draggable={false}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
        />
      </div>
      <div className="p-4">
        <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">
          {product.brand}
        </p>
        <h3
          className="font-display font-bold text-black text-sm mt-0.5 leading-tight"
          style={{ color: "#0D1117" }}
        >
          {product.name}
        </h3>
        <p
          className="font-mono font-extrabold text-base text-black mt-2"
          style={{ color: "#0D1117" }}
        >
          KES {product.price.toLocaleString()}
        </p>
      </div>
      {product.verified && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-black text-green">
          <ShieldCheck size={10} strokeWidth={2.5} /> Verified
        </div>
      )}
    </div>
  );
}

// ── BrandSection ──────────────────────────────────────────────
function BrandSection({ brand, products }) {
  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);
  if (!products.length) return null;

  const ROWS = 3;
  const totalPages = Math.ceil(products.length / ROWS);

  const scrollTo = (dir) => {
    const next = Math.max(0, Math.min(totalPages - 1, page + dir));
    setPage(next);
    if (scrollRef.current) {
      const cardW = scrollRef.current.offsetWidth + 16;
      scrollRef.current.scrollTo({
        left: next * cardW * ROWS,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3
          className="font-display font-extrabold text-xl text-black"
          style={{ color: "#0D1117" }}
        >
          {brand}
        </h3>
        <span className="text-gray-400 text-xs">
          {products.length} listing{products.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id || p.id} product={p} />
        ))}
      </div>
      <div className="sm:hidden flex flex-col gap-3">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {products.map((p) => (
            <div
              key={p._id || p.id}
              className="flex-shrink-0 w-[calc(100%-1rem)] snap-start"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        {products.length > 1 && (
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => scrollTo(-1)}
              disabled={page === 0}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-black disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} strokeWidth={2.5} /> Prev
            </button>
            <div className="flex gap-1.5">
              {products.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${Math.floor(i / ROWS) === page ? "w-4 bg-black" : "w-1.5 bg-beige-dark"}`}
                />
              ))}
            </div>
            <button
              onClick={() => scrollTo(1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-black disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Marketplace ───────────────────────────────────────────────
export default function Marketplace() {
  const [tab, setTab] = useState("phones");
  const [brand, setBrand] = useState("All");
  const [condition, setCondition] = useState("All");
  const [priceRange, setPriceRange] = useState(0);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── API data ─────────────────────────────────────────────
  const [allListings, setAllListings] = useState([]); // all fetched (phones + laptops)
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const featuredRef = useDragScroll();

  // ── Fetch all active listings once on mount ──────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch phones and laptops in parallel
        const [phonesRes, laptopsRes] = await Promise.all([
          getAllListings({ category: "phone", limit: 100 }),
          getAllListings({ category: "laptop", limit: 100 }),
        ]);
        const combined = [...phonesRes.data, ...laptopsRes.data];
        setAllListings(combined);
        setFeatured(combined.filter((l) => l.verified).slice(0, 6));
      } catch (err) {
        setError(err.message || "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const brands = tab === "phones" ? PHONE_BRANDS : LAPTOP_BRANDS;
  const pool = allListings.filter(
    (l) => l.category === (tab === "phones" ? "phone" : "laptop"),
  );

  const handleTab = (t) => {
    setTab(t);
    setBrand("All");
  };

  // ── Client-side filtering (data already fetched) ─────────
  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceRange];
    const q = search.toLowerCase().trim();
    return pool.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      const matchBrand = brand === "All" || p.brand === brand;
      const matchCondition = condition === "All" || p.condition === condition;
      const matchPrice =
        (range.min === null || p.price >= range.min) &&
        (range.max === null || p.price <= range.max);
      return matchSearch && matchBrand && matchCondition && matchPrice;
    });
  }, [pool, brand, condition, priceRange, search]);

  const globalSearch = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allListings.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [search, allListings]);

  const grouped = useMemo(() => {
    const activeBrands =
      brand === "All" ? brands.filter((b) => b !== "All") : [brand];
    return activeBrands
      .map((b) => ({
        brand: b,
        products: filtered.filter((p) => p.brand === b),
      }))
      .filter((g) => g.products.length > 0);
  }, [filtered, brand, brands]);

  const activeFilters =
    (brand !== "All" ? 1 : 0) +
    (condition !== "All" ? 1 : 0) +
    (priceRange !== 0 ? 1 : 0);

  const pillBase =
    "px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer whitespace-nowrap";
  const pillOn = "bg-black text-white border-black";
  const pillOff =
    "bg-white text-gray-500 border-beige-dark hover:border-gray-400 hover:text-black";

  // ── Full-page loading ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">
        {/* Header + Search */}
        <div className="flex flex-col gap-5">
          <div>
            <h1
              className="font-display font-extrabold text-4xl sm:text-5xl text-black leading-tight"
              style={{ color: "#0D1117" }}
            >
              Marketplace
            </h1>
            <p className="text-gray-500 text-base mt-1">
              Browse verified phones and laptops.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="relative max-w-2xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search phones, laptops, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-beige-dark rounded-2xl pl-11 pr-11 py-4 text-sm placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200 shadow-sm"
              style={{ color: "#0D1117" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {search.trim() && (
            <div className="bg-white border border-beige-dark rounded-2xl p-5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-4">
                {globalSearch.length} result
                {globalSearch.length !== 1 ? "s" : ""} for "{search}"
              </p>
              {globalSearch.length === 0 ? (
                <p className="text-gray-400 text-sm">No devices found.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {globalSearch.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Featured */}
        {!search.trim() && featured.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2
                className="font-display font-bold text-2xl text-black"
                style={{ color: "#0D1117" }}
              >
                Featured Devices
              </h2>
              <span className="text-xs text-gray-400 font-medium select-none hidden sm:block">
                ← drag to scroll →
              </span>
              <span className="text-xs text-gray-400 font-medium sm:hidden">
                Scroll →
              </span>
            </div>
            <div
              ref={featuredRef}
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {featured.map((p) => (
                <div key={p._id} className="snap-start">
                  <FeaturedCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category + Filters */}
        {!search.trim() && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-3">
                {["phones", "laptops"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTab(t)}
                    className={`px-6 py-3 rounded-xl font-display font-bold text-base border-2 transition-all duration-200 capitalize ${tab === t ? "bg-black text-white border-black" : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${showFilters || activeFilters > 0 ? "bg-black text-white border-black" : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"}`}
              >
                <SlidersHorizontal size={15} strokeWidth={2} />
                Filters
                {activeFilters > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green text-black text-xs font-bold flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="bg-white border border-beige-dark rounded-2xl p-5 flex flex-col gap-5">
                {[
                  {
                    title: "Brand",
                    items: brands,
                    active: brand,
                    set: setBrand,
                  },
                  {
                    title: "Condition",
                    items: CONDITIONS,
                    active: condition,
                    set: setCondition,
                  },
                ].map(({ title, items, active, set }) => (
                  <div key={title} className="flex flex-col gap-2">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                      {title}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {items.map((item) => (
                        <button
                          key={item}
                          onClick={() => set(item)}
                          className={`${pillBase} ${active === item ? pillOn : pillOff}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                    Price Range
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {PRICE_RANGES.map((r, i) => (
                      <button
                        key={r.label}
                        onClick={() => setPriceRange(i)}
                        className={`${pillBase} ${priceRange === i ? pillOn : pillOff}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setBrand("All");
                      setCondition("All");
                      setPriceRange(0);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors w-fit"
                  >
                    <X size={14} /> Clear all filters
                  </button>
                )}
              </div>
            )}

            <p className="text-gray-400 text-sm">
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
              {activeFilters > 0 && " (filtered)"}
            </p>

            {grouped.length === 0 ? (
              <div className="bg-white border border-beige-dark rounded-2xl px-6 py-20 text-center">
                <p
                  className="font-display font-bold text-black text-xl mb-2"
                  style={{ color: "#0D1117" }}
                >
                  No listings found
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters.
                </p>
                <button
                  onClick={() => {
                    setBrand("All");
                    setCondition("All");
                    setPriceRange(0);
                  }}
                  className="mt-4 text-sm text-green hover:text-green-dark font-semibold"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                {grouped.map(({ brand: b, products }) => (
                  <BrandSection key={b} brand={b} products={products} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
