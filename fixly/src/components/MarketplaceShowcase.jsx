/**
 * MarketplaceShowcase.jsx
 * Homepage section — pulls real listings from your API.
 * Phones and laptops shown in separate rows.
 * Gracefully handles few listings now, scales as you add more.
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ChevronRight,
  Laptop,
  Smartphone,
  Eye,
  Star,
  Zap,
  ArrowRight,
  Tag,
  TrendingUp,
} from "lucide-react";
import { getAllListings } from "../Hooks/marketplaceApi";

// ─── Constants ────────────────────────────────────────────────────────────────
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";

const COND_STYLES = {
  New: { bg: "#dcfce7", color: "#15803d" },
  Used: { bg: "#fef9c3", color: "#854d0e" },
  Refurbished: { bg: "#ede9fe", color: "#6d28d9" },
  "Like New": { bg: "#dbeafe", color: "#1d4ed8" },
  Fair: { bg: "#ffedd5", color: "#c2410c" },
};

// ─── Classify listings by category field ──────────────────────────────────────
function isPhone(p) {
  return (p.category || "").toLowerCase() === "phone";
}
function isLaptop(p) {
  return (p.category || "").toLowerCase() === "laptop";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #f0ebe0",
      }}
    >
      <div
        style={{
          width: "100%",
          paddingTop: "90%",
          background:
            "linear-gradient(90deg,#f0ebe0 25%,#f8f4ee 50%,#f0ebe0 75%)",
          backgroundSize: "200% 100%",
          animation: "ms-shim 1.4s infinite",
        }}
      />
      <div
        style={{
          padding: "12px 14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        <div
          style={{
            height: 8,
            width: "35%",
            borderRadius: 4,
            background: "#f0ebe0",
            animation: "ms-shim 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 12,
            width: "80%",
            borderRadius: 4,
            background: "#f0ebe0",
            animation: "ms-shim 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 16,
            width: "50%",
            borderRadius: 4,
            background: "#f0ebe0",
            marginTop: 4,
            animation: "ms-shim 1.4s infinite",
          }}
        />
      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const cond = COND_STYLES[product.condition] || COND_STYLES["Used"];
  const discount =
    product.oldPrice && product.price < product.oldPrice
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : product.discount;

  return (
    <article
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${pid}`)}
      onClick={() => navigate(`/product/${pid}`)}
      style={{
        background: "white",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #eee8db",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        animation: `ms-fadein 0.45s ${index * 55}ms both ease`,
        transition:
          "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(13,17,23,0.11)";
        e.currentTarget.style.borderColor = "#c8bfad";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "#eee8db";
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: "90%",
          background: "#f5f0e8",
        }}
      >
        <img
          src={product.images?.[0] || FALLBACK_IMG}
          alt={product.name}
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.06)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "";
          }}
        />
        {/* Badges */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          {product.verified && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: "rgba(13,17,23,0.78)",
                backdropFilter: "blur(6px)",
                color: "#4ade80",
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 100,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              <ShieldCheck size={8} strokeWidth={2.5} /> OK
            </span>
          )}
          {discount && (
            <span
              style={{
                background: "#ef4444",
                color: "white",
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 100,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              -{discount}%
            </span>
          )}
        </div>
        {/* Condition */}
        <span
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            background: cond.bg,
            color: cond.color,
            fontSize: 8,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 100,
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {product.condition}
        </span>
        {/* Hover overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "all 0.22s ease",
          }}
          className="ms-card-ov"
        >
          <span
            style={{
              background: "#0d1117",
              color: "rgba(255,255,255,0.85)",
              fontSize: 10,
              fontWeight: 700,
              padding: "7px 16px",
              borderRadius: 100,
              transform: "translateY(4px)",
              transition: "transform 0.22s ease",
            }}
          >
            View details
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "11px 13px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
        }}
      >
        <p
          style={{
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9e927f",
            margin: 0,
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {product.brand}
        </p>
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0d1117",
            margin: 0,
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontFamily: "var(--font-display, 'Syne', sans-serif)",
          }}
        >
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  color:
                    i <= Math.round(product.rating) ? "#f59e0b" : "#e8e0d0",
                }}
              >
                ★
              </span>
            ))}
            <span
              style={{
                fontSize: 9,
                color: "#9e927f",
                marginLeft: 3,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: "#9e927f",
            marginTop: "auto",
          }}
        >
          <Eye size={9} />
          <span
            style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)" }}
          >
            {product.views || 0} views
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 7,
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 14,
              fontWeight: 700,
              color: "#0d1117",
            }}
          >
            KES {product.price?.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: "#b5a99a",
                textDecoration: "line-through",
              }}
            >
              {product.oldPrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#f5f0e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0d1117",
          opacity: 0,
          transform: "translateX(-4px)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}
        className="ms-arrow"
      >
        <ChevronRight size={12} />
      </div>
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ label, ctaRoute }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        gridColumn: "1/-1",
        textAlign: "center",
        padding: "40px 20px",
        color: "#9e927f",
        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 500 }}>
        No {label} listed yet — check back soon.
      </p>
      <button
        onClick={() => navigate(ctaRoute)}
        style={{
          marginTop: 12,
          fontSize: 11,
          fontWeight: 700,
          color: "#005f02",
          background: "none",
          border: "1px solid #c5d9a0",
          padding: "6px 16px",
          borderRadius: 100,
          cursor: "pointer",
          fontFamily: "var(--font-mono, monospace)",
          letterSpacing: "0.06em",
        }}
      >
        Browse all →
      </button>
    </div>
  );
}

// ─── Section row ─────────────────────────────────────────────────────────────
function CategorySection({
  label,
  icon: Icon,
  badge,
  items,
  loading,
  ctaRoute,
  accentColor,
}) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 4;
  const visible = showAll ? items : items.slice(0, INITIAL_COUNT);
  const hasMore = items.length > INITIAL_COUNT;

  return (
    <div style={{ marginBottom: 48 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "#0d1117",
              color: "rgba(255,255,255,0.85)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "6px 14px 6px 11px",
              borderRadius: 100,
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
            }}
          >
            <Icon size={12} strokeWidth={2.5} style={{ color: accentColor }} />
            {label}
          </span>
          {badge && !loading && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                background: "#fef9c3",
                color: "#854d0e",
                padding: "2px 10px",
                borderRadius: 100,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "#6b5f52",
                background: "none",
                border: "1.5px solid #e8e0d0",
                padding: "5px 13px",
                borderRadius: 100,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#0d1117";
                e.target.style.color = "#0d1117";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#e8e0d0";
                e.target.style.color = "#6b5f52";
              }}
            >
              {showAll ? "Show less" : `See all ${items.length}`}{" "}
              <ChevronRight size={11} />
            </button>
          )}
          <button
            onClick={() => navigate(ctaRoute)}
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "white",
              background: accentColor,
              border: "none",
              padding: "6px 14px",
              borderRadius: 100,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
              transition: "filter 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "";
            }}
          >
            Browse all <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : visible.length === 0 ? (
          <EmptyState label={label.toLowerCase()} ctaRoute={ctaRoute} />
        ) : (
          visible.map((p, i) => (
            <ProductCard key={p._id || p.id} product={p} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function DealsTicker({ items }) {
  const deals = items.filter((p) => p.oldPrice && p.price < p.oldPrice);
  if (!deals.length) return null;
  const repeated = [...deals, ...deals, ...deals];
  return (
    <div
      style={{
        background: "#005f02",
        display: "flex",
        alignItems: "center",
        height: 32,
        overflow: "hidden",
        marginBottom: 0,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.9)",
          padding: "0 16px 0 14px",
          borderRight: "1px solid rgba(255,255,255,0.2)",
          height: "100%",
          fontFamily: "var(--font-mono, monospace)",
          whiteSpace: "nowrap",
        }}
      >
        <Tag size={9} style={{ fill: "currentColor" }} /> Hot deals
      </span>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          style={{
            display: "inline-flex",
            whiteSpace: "nowrap",
            alignItems: "center",
            fontSize: 10.5,
            color: "rgba(255,255,255,0.7)",
            padding: "0 20px",
            animation: "ms-tick 28s linear infinite",
            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
          }}
        >
          {repeated.map((p, i) => {
            const pct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
            return (
              <span key={i} style={{ marginRight: 32 }}>
                {p.brand} {p.name} ·{" "}
                <strong style={{ color: "white" }}>
                  KES {p.price?.toLocaleString()}
                </strong>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "rgba(255,255,255,0.4)",
                    marginLeft: 6,
                  }}
                >
                  {p.oldPrice?.toLocaleString()}
                </span>
                <span
                  style={{ color: "#a3e635", fontWeight: 700, marginLeft: 6 }}
                >
                  -{pct}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ total }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 28,
        paddingBottom: 20,
        borderBottom: "1px solid #e8e0d0",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#005f02",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            <TrendingUp size={10} /> Marketplace · Nairobi
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display, 'Syne', sans-serif)",
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 800,
            color: "#0d1117",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          Featured listings
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#9e927f",
            margin: "6px 0 0",
            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
          }}
        >
          {total > 0
            ? `${total} verified listings`
            : "Verified phones & laptops"}{" "}
          · Nairobi's best prices
        </p>
      </div>
      <button
        onClick={() => navigate("/marketplace")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#0d1117",
          color: "rgba(255,255,255,0.85)",
          border: "none",
          padding: "11px 22px",
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
          transition: "background 0.22s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#005f02";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0d1117";
        }}
      >
        Full marketplace <ArrowRight size={13} />
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function MarketplaceShowcase() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllListings({ limit: 100 })
      .then((res) => setAll(res.data || []))
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const phones = useMemo(() => all.filter(isPhone), [all]);
  const laptops = useMemo(() => all.filter(isLaptop), [all]);

  return (
    <>
      <style>{`
        @keyframes ms-fadein {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ms-shim {
          to { background-position: -200% 0; }
        }
        @keyframes ms-tick {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .ms-card-ov:hover { opacity: 1 !important; background: rgba(0,0,0,0.08) !important; }
        article:hover .ms-card-ov { opacity: 1; background: rgba(0,0,0,0.08); }
        article:hover .ms-arrow { opacity: 1 !important; transform: translateX(0) !important; }
      `}</style>

      <section
        style={{
          background: "#f5f0e8",
          fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
        }}
      >
        {/* Deals ticker — only when there are discounted items */}
        <DealsTicker items={all} />

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "36px 24px 56px",
          }}
        >
          {/* Section header */}
          <SectionHeader total={all.length} />

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 24,
              }}
            >
              <p style={{ color: "#991b1b", fontSize: 13, margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {/* Divider line between sections */}
          <CategorySection
            label="Laptops"
            icon={Laptop}
            badge={
              !loading && laptops.length > 0
                ? `${laptops.length} listed`
                : undefined
            }
            items={laptops}
            loading={loading}
            ctaRoute="/marketplace?tab=laptops"
            accentColor="#f97316"
          />

          {/* Green gradient divider */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(to right, #005f02, transparent)",
              margin: "0 0 40px",
            }}
          />

          <CategorySection
            label="Smartphones"
            icon={Smartphone}
            badge={
              !loading && phones.length > 0
                ? `${phones.length} listed`
                : undefined
            }
            items={phones}
            loading={loading}
            ctaRoute="/marketplace?tab=phones"
            accentColor="#06b6d4"
          />
        </div>

        {/* Bottom CTA strip */}
        <div
          style={{
            borderTop: "1px solid #e8e0d0",
            background: "white",
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              icon: <ShieldCheck size={13} style={{ color: "#005f02" }} />,
              text: "All sellers verified",
            },
            {
              icon: <Zap size={13} style={{ color: "#f97316" }} />,
              text: "Instant WhatsApp contact",
            },
            {
              icon: <Star size={13} style={{ color: "#f59e0b" }} />,
              text: "Rated by real buyers",
            },
          ].map(({ icon, text }) => (
            <span
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "#6b5f52",
                fontWeight: 500,
                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
              }}
            >
              {icon} {text}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
