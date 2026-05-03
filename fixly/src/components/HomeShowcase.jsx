/**
 * HomeShowcase.jsx
 * Drop this right below your Navbar.
 * Matches the Digitaz reference layout exactly:
 *   1. Hero slider (text left, product image right)
 *   2. Category icon row
 *   3. Three mini promo banners
 *   4. Featured Deals with countdown + product cards
 *   5. Wide promo + 2 smaller cards
 *   6. Trending grid with filter tabs
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Laptop,
  Wrench,
  ShoppingBag,
  ShieldCheck,
  Star,
  Eye,
  Zap,
  ArrowRight,
  Tag,
  Clock,
} from "lucide-react";
import { getAllListings } from "../Hooks/marketplaceApi";

// ─── Config ───────────────────────────────────────────────────────────────────

const FALLBACK =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";

// Hero slides: 4 exactly as requested
const HERO_SLIDES = [
  {
    id: "laptop-sale",
    eyebrow: "MARKETPLACE · LAPTOPS",
    headline: "Power your\nhustle for less.",
    sub: "Verified refurbished & new laptops from trusted Nairobi sellers.",
    price: "From KES 30,000",
    cta: "Shop Laptops",
    route: "/marketplace?tab=laptops",
    bg: "linear-gradient(135deg, #0f1923 0%, #1a2744 100%)",
    accent: "#f97316",
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80",
    tag: "New Arrivals",
    tagBg: "#f97316",
  },
  {
    id: "phone-sale",
    eyebrow: "MARKETPLACE · PHONES",
    headline: "Your next phone\nawaits you here.",
    sub: "Curated smartphones, every listing hand-checked before going live.",
    price: "From KES 1,000",
    cta: "Shop Phones",
    route: "/marketplace?tab=phones",
    bg: "linear-gradient(135deg, #0a1628 0%, #0e2040 100%)",
    accent: "#06b6d4",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80",
    tag: "Best Deals",
    tagBg: "#06b6d4",
  },
  {
    id: "phone-repair",
    eyebrow: "REPAIRS · PHONES",
    headline: "Cracked screen?\nFixed in 2 hours.",
    sub: "Expert phone repairs by verified Nairobi technicians. 90-day warranty.",
    price: "From KES 2,500",
    cta: "Book Repair",
    route: "/?device=phone",
    bg: "linear-gradient(135deg, #061a0a 0%, #0a2d10 100%)",
    accent: "#22c55e",
    img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=700&auto=format&fit=crop&q=80",
    tag: "Same Day",
    tagBg: "#22c55e",
  },
  {
    id: "laptop-repair",
    eyebrow: "REPAIRS · LAPTOPS",
    headline: "Dead laptop?\nBack today.",
    sub: "Diagnostics, screen fixes, OS reinstalls — genuine parts guaranteed.",
    price: "From KES 4,000",
    cta: "Book Repair",
    route: "/?device=laptop",
    bg: "linear-gradient(135deg, #150a2a 0%, #1e0f3a 100%)",
    accent: "#a855f7",
    img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80",
    tag: "Expert Fix",
    tagBg: "#a855f7",
  },
];

// Category icon row
const CATEGORIES = [
  { label: "All", Icon: ShoppingBag, tab: "all" },
  { label: "Phones", Icon: Smartphone, tab: "phones" },
  { label: "Laptops", Icon: Laptop, tab: "laptops" },
  { label: "Phone Repair", Icon: Wrench, tab: "phone-repair", repair: true },
  { label: "Laptop Repair", Icon: Wrench, tab: "laptop-repair", repair: true },
];

// Mini promo banners
const PROMOS = [
  {
    eyebrow: "GET REWARDED",
    headline: "Save 50% Off",
    sub: "Best refurbished laptops on the market",
    cta: "Shop now",
    route: "/marketplace?tab=laptops",
    bg: "#eef2ff",
    accent: "#4f46e5",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
  },
  {
    eyebrow: "NEW ARRIVALS",
    headline: "Latest Phones",
    sub: "Tecno, Samsung, Apple — all verified",
    cta: "Shop now",
    route: "/marketplace?tab=phones",
    bg: "#f0fdf4",
    accent: "#16a34a",
    img: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&auto=format&fit=crop&q=80",
  },
  {
    eyebrow: "TOP SERVICE",
    headline: "Fast Repairs",
    sub: "Phones & laptops fixed same day in Nairobi",
    cta: "Book now",
    route: "/",
    bg: "#fff7ed",
    accent: "#ea580c",
    img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&auto=format&fit=crop&q=80",
  },
];

const COND_STYLE = {
  New: { bg: "#dcfce7", color: "#15803d" },
  Used: { bg: "#fef9c3", color: "#854d0e" },
  Refurbished: { bg: "#ede9fe", color: "#6d28d9" },
  "Like New": { bg: "#dbeafe", color: "#1d4ed8" },
};

const TREND_TABS = [
  "Best Seller",
  "Sales",
  "New Arrivals",
  "Phones",
  "Laptops",
];

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(h = 11, m = 30, s = 0) {
  const [t, setT] = useState({ h, m, s });
  useEffect(() => {
    const id = setInterval(() => {
      setT((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) {
          s = 59;
          m--;
        }
        if (m < 0) {
          m = 59;
          h--;
        }
        if (h < 0) {
          return { h: 23, m: 59, s: 59 };
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n) => String(n).padStart(2, "0");
  return { ...t, p };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroSlider() {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  const go = (next) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setCur((next + HERO_SLIDES.length) % HERO_SLIDES.length);
      setFading(false);
    }, 300);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(cur + 1), 5000);
  };

  useEffect(() => {
    timerRef.current = setInterval(
      () => setCur((c) => (c + 1) % HERO_SLIDES.length),
      5000,
    );
    return () => clearInterval(timerRef.current);
  }, []);

  const s = HERO_SLIDES[cur];

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 0 }}>
      {/* Slide */}
      <div
        style={{
          background: s.bg,
          height: "70vh",
          maxHeight: 680,
          minHeight: 360,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          transition: "background 0.4s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle dot grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `radial-gradient(circle, ${s.accent}18 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* LEFT — text */}
        <div
          style={{
            padding: "52px 20px 52px clamp(24px,5vw,64px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
            position: "relative",
            zIndex: 2,
            opacity: fading ? 0 : 1,
            transform: fading ? "translateX(-16px)" : "none",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* Eyebrow */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              color: s.accent,
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {s.eyebrow}
          </span>

          {/* Tag badge */}
          <div>
            <span
              style={{
                display: "inline-block",
                background: s.tagBg,
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: 100,
                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                letterSpacing: "0.06em",
              }}
            >
              {s.tag}
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-display, 'Syne', sans-serif)",
              fontSize: "clamp(1.8rem,4vw,3rem)",
              fontWeight: 800,
              color: "white",
              margin: 0,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              whiteSpace: "pre-line",
            }}
          >
            {s.headline}
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.58)",
              margin: 0,
              lineHeight: 1.6,
              maxWidth: "34ch",
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
            }}
          >
            {s.sub}
          </p>

          {/* Price */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: s.accent,
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "-0.02em",
            }}
          >
            {s.price}
          </div>

          {/* CTA */}
          <div>
            <button
              onClick={() => navigate(s.route)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: s.accent,
                color: "white",
                border: "none",
                padding: "13px 28px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                boxShadow: `0 4px 20px ${s.accent}55`,
                transition: "filter 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.12)";
                e.currentTarget.style.transform = "translateX(3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "";
                e.currentTarget.style.transform = "";
              }}
            >
              {s.cta} <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT — image */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glow behind image */}
          <div
            style={{
              position: "absolute",
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${s.accent}30 0%, transparent 70%)`,
              right: -40,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <img
            key={s.id}
            src={s.img}
            alt={s.headline}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: fading ? 0 : 1,
              transform: fading ? "scale(0.97)" : "scale(1)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          />
        </div>

        {/* Arrows */}
        {[
          { dir: -1, style: { left: 16 }, Icon: ChevronLeft },
          { dir: 1, style: { right: 16 }, Icon: ChevronRight },
        ].map(({ dir, style, Icon }) => (
          <button
            key={dir}
            onClick={() => {
              reset();
              go(cur + dir);
            }}
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "background 0.2s",
              ...style,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
          >
            <Icon size={16} />
          </button>
        ))}

        {/* Dots */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
            zIndex: 10,
          }}
        >
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                reset();
                go(i);
              }}
              style={{
                width: i === cur ? 22 : 7,
                height: 7,
                borderRadius: 4,
                background: i === cur ? s.accent : "rgba(255,255,255,0.3)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryRow() {
  const navigate = useNavigate();
  const [active, setActive] = useState("all");
  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 clamp(16px,4vw,48px)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        overflowX: "auto",
        scrollbarWidth: "none",
        position: "relative",
      }}
    >
      <style>{`.cat-row::-webkit-scrollbar{display:none}`}</style>
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
              transition: "color 0.2s",
              color: isActive ? "#005f02" : "#666",
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
                transition: "background 0.2s",
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                style={{ color: isActive ? "#005f02" : "#888" }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
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
                  background: "#005f02",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function PromoRow() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        padding: "24px clamp(16px,4vw,48px)",
        background: "#f7f7f7",
      }}
    >
      {PROMOS.map((p, i) => (
        <div
          key={i}
          onClick={() => navigate(p.route)}
          style={{
            background: p.bg,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 0 20px 22px",
            cursor: "pointer",
            border: `1px solid ${p.accent}22`,
            transition: "box-shadow 0.22s ease, transform 0.22s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 8px 30px ${p.accent}22`;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "";
            e.currentTarget.style.transform = "";
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: p.accent,
                fontFamily: "var(--font-mono,monospace)",
              }}
            >
              {p.eyebrow}
            </span>
            <h3
              style={{
                fontFamily: "var(--font-display,'Syne',sans-serif)",
                fontSize: 17,
                fontWeight: 800,
                color: "#111",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {p.headline}
            </h3>
            <p
              style={{
                fontSize: 11,
                color: "#666",
                margin: 0,
                fontFamily: "var(--font-body,'DM Sans',sans-serif)",
              }}
            >
              {p.sub}
            </p>
            <button
              style={{
                marginTop: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: p.accent,
                color: "white",
                border: "none",
                padding: "7px 14px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                width: "fit-content",
                fontFamily: "var(--font-body,'DM Sans',sans-serif)",
              }}
            >
              {p.cta} <ArrowRight size={11} />
            </button>
          </div>
          <img
            src={p.img}
            alt={p.headline}
            style={{
              width: 110,
              height: 100,
              objectFit: "cover",
              borderRadius: "8px 0 0 8px",
              flexShrink: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function CountdownBlock({ h, m, s, pad }) {
  const blocks = [
    { v: pad(h), l: "Hrs" },
    { v: pad(m), l: "Min" },
    { v: pad(s), l: "Sec" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {blocks.map(({ v, l }, i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                background: "#111",
                color: "white",
                fontWeight: 800,
                fontFamily: "var(--font-mono,monospace)",
                fontSize: 16,
                padding: "4px 9px",
                borderRadius: 5,
                minWidth: 36,
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              {v}
            </span>
            <span
              style={{
                fontSize: 9,
                color: "#999",
                marginTop: 2,
                fontFamily: "var(--font-body,'DM Sans',sans-serif)",
              }}
            >
              {l}
            </span>
          </div>
          {i < 2 && (
            <span
              style={{
                color: "#999",
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductCardSmall({ product, index }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const cond = COND_STYLE[product.condition] || COND_STYLE["Used"];
  const discount =
    product.oldPrice && product.price < product.oldPrice
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : product.discount;

  // fake stock for deals row
  const total = 20;
  const sold = Math.min(Math.floor((product.views || 3) * 0.6), total - 1);

  return (
    <div
      onClick={() => navigate(`/product/${pid}`)}
      style={{
        background: "white",
        border: "1px solid #efefef",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        width: 170,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        animation: `hs-fadein 0.4s ${index * 60}ms both ease`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }}
    >
      <div
        style={{
          position: "relative",
          paddingTop: "90%",
          background: "#f9f9f9",
          overflow: "hidden",
        }}
      >
        <img
          src={product.images?.[0] || FALLBACK}
          alt={product.name}
          onError={(e) => {
            e.target.src = FALLBACK;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.06)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "";
          }}
        />
        {discount && (
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "#ef4444",
              color: "white",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 7px",
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
              top: 6,
              right: 6,
              background: "rgba(0,0,0,0.7)",
              color: "#4ade80",
              fontSize: 8,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 100,
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            <ShieldCheck size={7} /> OK
          </span>
        )}
      </div>
      <div
        style={{
          padding: "10px 11px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: "#999",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono,monospace)",
          }}
        >
          {product.brand}
        </span>
        <p
          style={{
            fontSize: 12,
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
        </p>

        {/* stars */}
        <div style={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{ fontSize: 9, color: i <= 3 ? "#f59e0b" : "#ddd" }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Stock bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 8,
              color: "#999",
              marginBottom: 3,
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            <span>
              Sold: <strong style={{ color: "#333" }}>{sold}</strong>
            </span>
            <span>
              Avail: <strong style={{ color: "#333" }}>{total - sold}</strong>
            </span>
          </div>
          <div
            style={{
              height: 3,
              background: "#f0f0f0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(sold / total) * 100}%`,
                background: "#f97316",
                borderRadius: 2,
              }}
            />
          </div>
        </div>

        {/* Price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 5,
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#111",
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            KES {product.price?.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span
              style={{
                fontSize: 9,
                color: "#bbb",
                textDecoration: "line-through",
                fontFamily: "var(--font-mono,monospace)",
              }}
            >
              {product.oldPrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCardGrid({ product, index }) {
  const navigate = useNavigate();
  const pid = product._id || product.id;
  const discount =
    product.oldPrice && product.price < product.oldPrice
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : product.discount;

  return (
    <div
      onClick={() => navigate(`/product/${pid}`)}
      style={{
        background: "white",
        border: "1px solid #efefef",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
        animation: `hs-fadein 0.4s ${index * 55}ms both ease`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 22px rgba(0,0,0,0.09)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.transform = "";
      }}
    >
      <div
        style={{
          position: "relative",
          paddingTop: "80%",
          background: "#f9f9f9",
          overflow: "hidden",
        }}
      >
        <img
          src={product.images?.[0] || FALLBACK}
          alt={product.name}
          onError={(e) => {
            e.target.src = FALLBACK;
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.06)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "";
          }}
        />
        {discount && (
          <span
            style={{
              position: "absolute",
              top: 7,
              left: 7,
              background: "#ef4444",
              color: "white",
              fontSize: 8,
              fontWeight: 700,
              padding: "2px 7px",
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
              top: 7,
              right: 7,
              background: "rgba(0,0,0,0.72)",
              color: "#4ade80",
              fontSize: 8,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 100,
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            <ShieldCheck size={7} /> OK
          </span>
        )}
      </div>
      <div
        style={{
          padding: "10px 12px 13px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <p
          style={{
            fontSize: 8,
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
            fontSize: 12,
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
        <div style={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{ fontSize: 9, color: i <= 3 ? "#f59e0b" : "#eee" }}
            >
              ★
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: "auto",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#111",
              fontFamily: "var(--font-mono,monospace)",
            }}
          >
            KES {product.price?.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span
              style={{
                fontSize: 9,
                color: "#bbb",
                textDecoration: "line-through",
                fontFamily: "var(--font-mono,monospace)",
              }}
            >
              {product.oldPrice?.toLocaleString()}
            </span>
          )}
        </div>
        {product.oldPrice && (
          <div style={{ height: 2, background: "#f0f0f0", borderRadius: 1 }}>
            <div
              style={{
                height: "100%",
                width: "65%",
                background: "#005f02",
                borderRadius: 1,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonSmall() {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #efefef",
        borderRadius: 10,
        overflow: "hidden",
        flexShrink: 0,
        width: 170,
      }}
    >
      <div
        style={{
          paddingTop: "90%",
          background: "#f0f0f0",
          animation: "hs-shim 1.4s infinite",
        }}
      />
      <div
        style={{
          padding: "10px 11px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            height: 7,
            width: "35%",
            background: "#f0f0f0",
            borderRadius: 4,
            animation: "hs-shim 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 11,
            width: "80%",
            background: "#f0f0f0",
            borderRadius: 4,
            animation: "hs-shim 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 13,
            width: "50%",
            background: "#f0f0f0",
            borderRadius: 4,
            animation: "hs-shim 1.4s infinite",
          }}
        />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #efefef",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          paddingTop: "80%",
          background: "#f0f0f0",
          animation: "hs-shim 1.4s infinite",
        }}
      />
      <div
        style={{
          padding: "10px 12px 13px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            height: 7,
            width: "30%",
            background: "#f0f0f0",
            borderRadius: 4,
            animation: "hs-shim 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 11,
            width: "75%",
            background: "#f0f0f0",
            borderRadius: 4,
            animation: "hs-shim 1.4s infinite",
          }}
        />
        <div
          style={{
            height: 13,
            width: "45%",
            background: "#f0f0f0",
            borderRadius: 4,
            animation: "hs-shim 1.4s infinite",
          }}
        />
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
  const { h, m, s, p } = useCountdown(11, 28, 0);

  useEffect(() => {
    getAllListings({ limit: 100 })
      .then((res) => setAll(res.data || []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const phones = useMemo(
    () => all.filter((p) => p.category === "phone"),
    [all],
  );
  const laptops = useMemo(
    () => all.filter((p) => p.category === "laptop"),
    [all],
  );
  const deals = useMemo(
    () => all.filter((p) => p.oldPrice || p.discount),
    [all],
  );
  const byViews = useMemo(
    () => [...all].sort((a, b) => (b.views || 0) - (a.views || 0)),
    [all],
  );

  // Trending tab filter
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
        return byViews; // Best Seller
    }
  }, [trendTab, all, deals, phones, laptops, byViews]);

  // Wide promo listing (most viewed)
  const featuredItem = byViews[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes hs-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hs-shim   { to{background-position:-200% 0} }
        .hs-deals-scroll { scrollbar-width: none; }
        .hs-deals-scroll::-webkit-scrollbar { display: none; }
        * { box-sizing: border-box; }
        @media(max-width:768px){
          .hs-promo-grid { grid-template-columns: 1fr !important; }
          .hs-trend-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hs-wide-grid  { grid-template-columns: 1fr !important; }
        }
        @media(max-width:480px){
          .hs-trend-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          fontFamily: "var(--font-body,'DM Sans',sans-serif)",
          background: "#f7f7f7",
        }}
      >
        {/* 1 ── HERO SLIDER */}
        <HeroSlider />

        {/* 2 ── CATEGORY ROW */}
        <CategoryRow />

        {/* 3 ── PROMO BANNERS */}
        <div style={{ padding: "20px clamp(16px,4vw,48px)" }}>
          <div
            className="hs-promo-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 14,
            }}
          >
            {PROMOS.map((p, i) => (
              <div
                key={i}
                onClick={() => navigate(p.route)}
                style={{
                  background: p.bg,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: `1px solid ${p.accent}1a`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  minHeight: 110,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${p.accent}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: "16px 0 16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: p.accent,
                      fontFamily: "var(--font-mono,monospace)",
                    }}
                  >
                    {p.eyebrow}
                  </span>
                  <strong
                    style={{
                      fontFamily: "var(--font-display,'Syne',sans-serif)",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#111",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.headline}
                  </strong>
                  <span style={{ fontSize: 10.5, color: "#777" }}>{p.sub}</span>
                  <span
                    style={{
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      color: p.accent,
                      border: `1px solid ${p.accent}`,
                      padding: "4px 12px",
                      borderRadius: 100,
                      width: "fit-content",
                      cursor: "pointer",
                    }}
                  >
                    {p.cta} →
                  </span>
                </div>
                <img
                  src={p.img}
                  alt={p.headline}
                  style={{
                    width: 100,
                    height: "100%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4 ── FEATURED DEALS with countdown */}
        <div style={{ padding: "0 clamp(16px,4vw,48px) 20px" }}>
          {/* Header */}
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display,'Syne',sans-serif)",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#111",
                  margin: 0,
                }}
              >
                Today's Featured Deals
              </h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  color: "#e53e3e",
                  fontWeight: 600,
                  fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                }}
              >
                <Tag size={11} /> Limited time
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={13} style={{ color: "#666" }} />
                <span
                  style={{
                    fontSize: 11,
                    color: "#666",
                    fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                  }}
                >
                  Ends in:
                </span>
              </div>
              <CountdownBlock h={h} m={m} s={s} pad={p} />
              <div style={{ display: "flex", gap: 4 }}>
                {["<", ">"].map((ch, i) => (
                  <button
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "1px solid #ddd",
                      background: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: "#555",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Horizontal scroll row */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "1px solid #efefef",
              padding: "16px",
              overflow: "hidden",
            }}
          >
            <div
              className="hs-deals-scroll"
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonSmall key={i} />
                ))
              ) : all.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "#aaa",
                    padding: "20px 0",
                    fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                  }}
                >
                  No listings yet — add products to see them here.
                </p>
              ) : (
                all.map((product, i) => (
                  <ProductCardSmall
                    key={product._id}
                    product={product}
                    index={i}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* 5 ── WIDE PROMO + 2 SMALL CARDS */}
        {!loading && all.length > 0 && (
          <div style={{ padding: "0 clamp(16px,4vw,48px) 20px" }}>
            <div
              className="hs-wide-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr",
                gap: 14,
              }}
            >
              {/* Wide left — repair CTA */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #0a1628 0%, #0e2a4a 100%)",
                  borderRadius: 12,
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 200,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/")}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 280,
                    height: 280,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)",
                    top: -80,
                    right: -60,
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: "#f97316",
                      fontFamily: "var(--font-mono,monospace)",
                    }}
                  >
                    GET IT FIXED
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-display,'Syne',sans-serif)",
                      fontSize: 22,
                      fontWeight: 800,
                      color: "white",
                      margin: "8px 0 6px",
                      lineHeight: 1.15,
                    }}
                  >
                    Fast Repairs.
                    <br />
                    Real Warranty.
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                      margin: 0,
                      fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                    }}
                  >
                    Phones & laptops fixed by verified techs. 90-day guarantee
                    on every repair.
                  </p>
                </div>
                <button
                  style={{
                    marginTop: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "#f97316",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    width: "fit-content",
                    fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                  }}
                >
                  Book a repair <ArrowRight size={12} />
                </button>
              </div>

              {/* Right 2 — real products or fallback promo cards */}
              {all.slice(0, 2).map((product, i) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #efefef",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  <div
                    style={{
                      paddingTop: "60%",
                      position: "relative",
                      background: "#f9f9f9",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={product.images?.[0] || FALLBACK}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = FALLBACK;
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {(product.discount || product.oldPrice) && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          background: "#ef4444",
                          color: "white",
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 100,
                          fontFamily: "var(--font-mono,monospace)",
                        }}
                      >
                        {product.discount
                          ? `-${product.discount}%`
                          : `-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%`}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px 14px" }}>
                    <p
                      style={{
                        fontSize: 9,
                        color: "#aaa",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        margin: "0 0 4px",
                        fontFamily: "var(--font-mono,monospace)",
                      }}
                    >
                      {product.brand}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#111",
                        margin: "0 0 6px",
                        lineHeight: 1.3,
                        fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                      }}
                    >
                      {product.name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 6,
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 14,
                          color: "#111",
                          fontFamily: "var(--font-mono,monospace)",
                        }}
                      >
                        KES {product.price?.toLocaleString()}
                      </strong>
                      {product.oldPrice && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#bbb",
                            textDecoration: "line-through",
                            fontFamily: "var(--font-mono,monospace)",
                          }}
                        >
                          {product.oldPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#005f02",
                        border: "1px solid #005f02",
                        padding: "4px 12px",
                        borderRadius: 100,
                        fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                      }}
                    >
                      View →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6 ── TRENDING THIS WEEK */}
        <div style={{ padding: "0 clamp(16px,4vw,48px) 40px" }}>
          {/* Header + tabs */}
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
                fontFamily: "var(--font-display,'Syne',sans-serif)",
                fontSize: 18,
                fontWeight: 800,
                color: "#111",
                margin: 0,
              }}
            >
              Trending This Week
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
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
                    borderColor: trendTab === tab ? "#005f02" : "#e0e0e0",
                    background: trendTab === tab ? "#005f02" : "white",
                    color: trendTab === tab ? "white" : "#555",
                    cursor: "pointer",
                    transition: "all 0.2s",
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
                  color: "#005f02",
                  cursor: "pointer",
                  fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                }}
              >
                View All →
              </button>
            </div>
          </div>

          {/* Grid */}
          <div
            className="hs-trend-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonGrid key={i} />)
            ) : trending.length === 0 ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#aaa",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontFamily: "var(--font-body,'DM Sans',sans-serif)",
                  }}
                >
                  No listings here yet — add products to populate this section.
                </p>
              </div>
            ) : (
              trending
                .slice(0, 8)
                .map((product, i) => (
                  <ProductCardGrid
                    key={product._id}
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
