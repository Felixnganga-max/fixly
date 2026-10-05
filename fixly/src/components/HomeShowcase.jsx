/**
 * HomeShowcase.jsx — drop below the Navbar.
 *   1. Category row
 *   2. Fresh picks  (2 phones + 1 laptop OR 2 laptops + 1 phone, mixed brands)
 *   3. Shop by budget  → routes to /marketplace with tab + minPrice/maxPrice
 *   4. Trending This Week (filter tabs)
 *
 * Mobile: nothing stacks vertically. Rows swipe left/right.
 *   - Fresh picks: one swipeable row
 *   - Trending: 2 rows, swipe sideways for more devices
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  Laptop,
  Wrench,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { getAllListings } from "../Hooks/marketplaceApi";

// ─── Config ───────────────────────────────────────────────────────────────────

const FALLBACK =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80";

const GREEN = "#005f02";

const CATEGORIES = [
  { label: "All", Icon: ShoppingBag, tab: "all" },
  { label: "Phones", Icon: Smartphone, tab: "phones" },
  { label: "Laptops", Icon: Laptop, tab: "laptops" },
  { label: "Phone Repair", Icon: Wrench, tab: "phone-repair", repair: true },
  { label: "Laptop Repair", Icon: Wrench, tab: "laptop-repair", repair: true },
];

const TREND_TABS = ["Best Seller", "Sales", "New Arrivals", "Phones", "Laptops"];

// Budget ranges (KES). Lowest is 10K–20K. min/max null = open ended.
const RANGES = [
  { label: "10K – 20K", min: 10000, max: 20000 },
  { label: "20K – 30K", min: 20000, max: 30000 },
  { label: "30K – 40K", min: 30000, max: 40000 },
  { label: "40K+", min: 40000, max: null },
];
const BUDGETS = { all: RANGES, phones: RANGES, laptops: RANGES };

const BUDGET_TYPES = [
  { key: "phones", label: "Phones", Icon: Smartphone },
  { key: "laptops", label: "Laptops", Icon: Laptop },
  { key: "all", label: "Both", Icon: ShoppingBag },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const brandKey = (p) => (p.brand || "").trim().toLowerCase();

/**
 * 3 devices: 2 phones + 1 laptop, or 2 laptops + 1 phone (random).
 * Brands are kept distinct where the data allows it, and everything is
 * shuffled so the same brand doesn't always lead.
 */
function pickMix(phones, laptops, all) {
  const twoPhones = Math.random() < 0.5;
  const needPhones = twoPhones ? 2 : 1;
  const needLaptops = twoPhones ? 1 : 2;
  const usedBrands = new Set();

  const take = (pool, n) => {
    const s = shuffle(pool);
    const got = [];
    for (const p of s) {
      if (got.length === n) break;
      const b = brandKey(p);
      if (!usedBrands.has(b)) {
        usedBrands.add(b);
        got.push(p);
      }
    }
    for (const p of s) {
      if (got.length === n) break;
      if (!got.includes(p)) got.push(p);
    }
    return got;
  };

  const picked = [...take(phones, needPhones), ...take(laptops, needLaptops)];

  // not enough of one category? top up from anything else
  if (picked.length < 3) {
    const ids = new Set(picked.map((p) => p._id || p.id));
    for (const p of shuffle(all)) {
      if (picked.length === 3) break;
      if (!ids.has(p._id || p.id)) picked.push(p);
    }
  }
  return shuffle(picked);
}

const discountOf = (p) =>
  p.oldPrice && p.price < p.oldPrice
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : p.discount;

const fmt = (n) => Number(n || 0).toLocaleString();

// ─── Category row ─────────────────────────────────────────────────────────────

function CategoryRow() {
  const navigate = useNavigate();
  const [active, setActive] = useState("all");
  return (
    <div
      className="hs-noscroll"
      style={{
        background: "white",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 clamp(16px,4vw,48px)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        overflowX: "auto",
      }}
    >
      {CATEGORIES.map(({ label, Icon, tab, repair }) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => {
              setActive(tab);
              if (repair) navigate("/");
              else
                navigate(
                  tab === "all" ? "/marketplace" : `/marketplace?tab=${tab}`,
                );
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "16px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
              color: isActive ? GREEN : "#666",
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: isActive ? "#e8f5e9" : "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                style={{ color: isActive ? GREEN : "#888" }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 28,
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  background: GREEN,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Device card (used by Fresh picks + Trending) ─────────────────────────────

function DeviceCard({ product, index = 0, large = false }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const discount = discountOf(product);

  return (
    <div
      className="hs-card"
      onClick={() => navigate(`/product/${pid}`)}
      style={{ animation: `hs-fadein 0.4s ${index * 50}ms both ease` }}
    >
      {/* Square image box — contain, so the WHOLE device is visible */}
      <div className="hs-img-box">
        <img
          src={product.images?.[0] || FALLBACK}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = FALLBACK;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: large ? 10 : 6,
          }}
        />
        {discount && (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#ef4444",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 100,
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            -{discount}%
          </span>
        )}
        {product.verified && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.72)",
              color: "#4ade80",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 100,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            <ShieldCheck size={9} /> OK
          </span>
        )}
      </div>

      <div
        style={{
          padding: large ? "14px 16px 16px" : "10px 12px 13px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#aaa",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
            fontFamily: "var(--font-mono,monospace)",
          }}
        >
          {product.brand}
        </p>
        <h3
          style={{
            fontSize: large ? 14 : 12,
            fontWeight: 600,
            color: "#111",
            margin: 0,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontFamily: "var(--font-body,'DM Sans',sans-serif)",
          }}
        >
          {product.name}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginTop: "auto",
            paddingTop: 4,
          }}
        >
          <span
            style={{
              fontSize: large ? 15 : 13,
              fontWeight: 800,
              color: "#111",
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            KES {fmt(product.price)}
          </span>
          {product.oldPrice && (
            <span
              style={{
                fontSize: 10,
                color: "#bbb",
                textDecoration: "line-through",
                fontFamily: "var(--font-mono,monospace)",
              }}
            >
              {fmt(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="hs-card" style={{ pointerEvents: "none" }}>
      <div className="hs-img-box hs-shim" />
      <div
        style={{
          padding: "10px 12px 13px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div className="hs-shim" style={{ height: 7, width: "30%", borderRadius: 4 }} />
        <div className="hs-shim" style={{ height: 11, width: "75%", borderRadius: 4 }} />
        <div className="hs-shim" style={{ height: 13, width: "45%", borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ─── Budget picker ────────────────────────────────────────────────────────────

function BudgetPicker() {
  const navigate = useNavigate();
  const [type, setType] = useState("phones");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const go = (lo, hi) => {
    const q = new URLSearchParams();
    if (type !== "all") q.set("tab", type);
    if (lo) q.set("minPrice", String(lo));
    if (hi) q.set("maxPrice", String(hi));
    const qs = q.toString();
    navigate(qs ? `/marketplace?${qs}` : "/marketplace");
  };

  const input = {
    width: "100%",
    padding: "11px 12px 11px 44px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "var(--font-mono,monospace)",
    background: "white",
    outline: "none",
  };

  return (
    <div style={{ padding: "0 clamp(16px,4vw,48px) 28px" }}>
      <div
        style={{
          background: "white",
          border: "1px solid #efefef",
          borderRadius: 14,
          padding: "22px clamp(16px,3vw,28px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-hero,'Montserrat',sans-serif)",
                fontSize: 18,
                fontWeight: 800,
                color: "#111",
                margin: 0,
              }}
            >
              Shop by budget
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#777",
                margin: "4px 0 0",
                fontFamily: "var(--font-body,'DM Sans',sans-serif)",
              }}
            >
              Pick what you can spend. We show only devices in that range.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {BUDGET_TYPES.map(({ key, label, Icon }) => {
              const on = type === key;
              return (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid",
                    borderColor: on ? GREEN : "#e0e0e0",
                    background: on ? GREEN : "white",
                    color: on ? "white" : "#555",
                    cursor: "pointer",
                    fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget chips — single swipeable row on mobile */}
        <div className="hs-budget-chips hs-noscroll">
          {BUDGETS[type].map((b) => (
            <button
              key={b.label}
              className="hs-budget-chip"
              onClick={() => go(b.min, b.max)}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono,monospace)",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#111",
                }}
              >
                {b.label}
              </span>
              <span style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
                KES
              </span>
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div className="hs-budget-custom">
          <div style={{ position: "relative", flex: 1, minWidth: 130 }}>
            <span className="hs-kes">KES</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              style={input}
            />
          </div>
          <span style={{ color: "#bbb" }}>to</span>
          <div style={{ position: "relative", flex: 1, minWidth: 130 }}>
            <span className="hs-kes">KES</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              style={input}
            />
          </div>
          <button
            onClick={() => go(min, max)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: GREEN,
              color: "white",
              border: "none",
              padding: "12px 22px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-body,'DM Sans',sans-serif)",
            }}
          >
            Show devices <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HomeShowcase() {
  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendTab, setTrendTab] = useState("Best Seller");

  useEffect(() => {
    getAllListings({ limit: 100 })
      .then((res) => setAll(res.data || []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const phones = useMemo(() => all.filter((p) => p.category === "phone"), [all]);
  const laptops = useMemo(() => all.filter((p) => p.category === "laptop"), [all]);
  const deals = useMemo(() => all.filter((p) => p.oldPrice || p.discount), [all]);
  const byViews = useMemo(
    () => [...all].sort((a, b) => (b.views || 0) - (a.views || 0)),
    [all],
  );

  // Fresh picks: 2+1 mix, brands shuffled. Re-rolls only when listings change.
  const picks = useMemo(
    () => (all.length ? pickMix(phones, laptops, all) : []),
    [all, phones, laptops],
  );

  const trending = useMemo(() => {
    switch (trendTab) {
      case "Sales":
        return deals;
      case "New Arrivals":
        return [...all].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      case "Phones":
        return phones;
      case "Laptops":
        return laptops;
      default:
        return byViews;
    }
  }, [trendTab, all, deals, phones, laptops, byViews]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;800&display=swap');
        @keyframes hs-fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hs-shim { to { background-position: -200% 0; } }

        .hs-root, .hs-root * { box-sizing: border-box; }
        .hs-noscroll { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .hs-noscroll::-webkit-scrollbar { display: none; }
        .hs-shim {
          background: linear-gradient(90deg,#f0f0f0 25%,#f8f8f8 50%,#f0f0f0 75%);
          background-size: 200% 100%;
          animation: hs-shim 1.4s infinite;
        }

        /* card */
        .hs-card {
          background: white; border: 1px solid #efefef; border-radius: 12px;
          overflow: hidden; cursor: pointer; display: flex; flex-direction: column;
          min-width: 0; transition: box-shadow .2s, transform .2s;
        }
        .hs-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.09); transform: translateY(-3px); }
        .hs-img-box { position: relative; width: 100%; padding-top: 100%; background: #fafafa; overflow: hidden; }

        /* fresh picks: 3 across on desktop */
        .hs-picks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        /* trending: 4 across on desktop */
        .hs-trend-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

        /* budget */
        .hs-budget-chips { display: flex; gap: 10px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 2px; }
        .hs-budget-chip {
          flex: 1 0 130px; display: flex; flex-direction: column; align-items: center;
          padding: 16px 12px; border: 1px solid #e6e6e6; border-radius: 12px; background: #fafafa;
          cursor: pointer; transition: border-color .2s, background .2s, transform .2s;
          font-family: var(--font-body,'DM Sans',sans-serif);
        }
        .hs-budget-chip:hover { border-color: ${GREEN}; background: #f1f8f1; transform: translateY(-2px); }
        .hs-budget-custom { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hs-kes {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          font-size: 10px; font-weight: 700; color: #999; font-family: var(--font-mono,monospace);
          pointer-events: none;
        }

        /* ── small devices: swipe sideways, never a long vertical stack ── */
        @media (max-width: 768px) {
          .hs-picks {
            display: flex; overflow-x: auto; gap: 12px;
            scroll-snap-type: x mandatory; padding-bottom: 6px;
          }
          .hs-picks > .hs-card { flex: 0 0 62%; scroll-snap-align: start; }

          /* 2 rows, swipe left/right for more — 2 devices visible per row */
          .hs-trend-grid {
            grid-template-columns: none;
            grid-template-rows: repeat(2, auto);
            grid-auto-flow: column;
            grid-auto-columns: calc(50% - 6px);
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 6px;
          }
          .hs-trend-grid > .hs-card { scroll-snap-align: start; }
          .hs-budget-custom > button { width: 100%; }
        }
      `}</style>

      <div
        className="hs-root"
        style={{
          fontFamily: "var(--font-body,'DM Sans',sans-serif)",
          background: "#f7f7f7",
        }}
      >
        {/* 1 ── CATEGORY ROW */}
        <CategoryRow />

        {/* 2 ── FRESH PICKS (2 phones + 1 laptop, or 2 laptops + 1 phone) */}
        <div style={{ padding: "24px clamp(16px,4vw,48px) 28px" }}>
          <div className="hs-picks hs-noscroll">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : picks.map((product, i) => (
                  <DeviceCard
                    key={product._id || product.id}
                    product={product}
                    index={i}
                    large
                  />
                ))}
          </div>
        </div>

        {/* 3 ── SHOP BY BUDGET */}
        <BudgetPicker />

        {/* 4 ── TRENDING THIS WEEK */}
        <div style={{ padding: "0 clamp(16px,4vw,48px) 40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-hero,'Montserrat',sans-serif)",
                fontSize: 18,
                fontWeight: 800,
                color: "#111",
                margin: 0,
              }}
            >
              Trending This Week
            </h2>
            <div
              className="hs-noscroll"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                overflowX: "auto",
                maxWidth: "100%",
              }}
            >
              {TREND_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTrendTab(tab)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    border: "1px solid",
                    borderColor: trendTab === tab ? GREEN : "#e0e0e0",
                    background: trendTab === tab ? GREEN : "white",
                    color: trendTab === tab ? "white" : "#555",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                  }}
                >
                  {tab}
                </button>
              ))}
              <button
                onClick={() => navigate("/marketplace")}
                style={{
                  padding: "5px 14px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  border: "1px solid #ddd",
                  background: "white",
                  color: GREEN,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                }}
              >
                View All →
              </button>
            </div>
          </div>

          <div className="hs-trend-grid hs-noscroll">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : trending.length === 0 ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#aaa",
                  fontSize: 13,
                }}
              >
                No listings here yet.
              </div>
            ) : (
              trending
                .slice(0, 12)
                .map((product, i) => (
                  <DeviceCard
                    key={product._id || product.id}
                    product={product}
                    index={i}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}