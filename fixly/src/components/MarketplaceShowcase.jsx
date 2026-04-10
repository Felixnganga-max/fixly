/**
 * MarketplaceShowcase.jsx  —  L99 Homepage Section
 *
 * Uses ONLY project design tokens from :root — no @import, no new fonts.
 * Fonts: var(--font-display) / var(--font-body) / var(--font-mono)
 * Colors: var(--color-*) | Radii: var(--radius-*)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Laptop,
  Smartphone,
  Flame,
  TrendingUp,
  Zap,
  Eye,
} from "lucide-react";
import { getAllListings } from "../Hooks/marketplaceApi";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */

const LAPTOP_KEYS = [
  "laptop",
  "macbook",
  "notebook",
  "chromebook",
  "thinkpad",
  "xps",
  "elitebook",
  "probook",
  "ideapad",
  "legion",
  "rog",
  "zenbook",
  "aspire",
  "nitro",
  "surface",
  "razer",
  "msi stealth",
];
const PHONE_KEYS = [
  "phone",
  "smartphone",
  "iphone",
  "samsung",
  "pixel",
  "android",
  "mobile",
  "xiaomi",
  "oneplus",
  "redmi",
  "tecno",
  "infinix",
  "itel",
  "oppo",
  "vivo",
  "realme",
  "huawei",
  "nokia",
  "motorola",
];
const TABLET_KEYS = ["ipad", "galaxy tab", "tab s", "tab a", "tablet"];

function classify(p) {
  const h = `${p.name} ${p.brand} ${p.category ?? ""}`.toLowerCase();
  if (TABLET_KEYS.some((k) => h.includes(k))) return "tablet";
  if (LAPTOP_KEYS.some((k) => h.includes(k))) return "laptop";
  if (PHONE_KEYS.some((k) => h.includes(k))) return "phone";
  return "other";
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";

const HERO_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=85",
    tag: "Editor's pick",
    title: "MacBook Pro M3",
    sub: "From KES 175,000 · Verified sellers",
    cta: "Browse Macs",
  },
  {
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=85",
    tag: "Hot right now",
    title: "iPhone 15 Pro Max",
    sub: "From KES 135,000 · Nairobi CBD",
    cta: "Browse iPhones",
  },
  {
    img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&auto=format&fit=crop&q=85",
    tag: "Best value",
    title: "Budget Laptops",
    sub: "Ryzen & Core i5 · under KES 60k",
    cta: "Explore now",
  },
];

const ANIMATED_WORDS = ["buying.", "selling.", "upgrading.", "flipping."];

const COND_CHIP = {
  New: { bg: "var(--color-green-light)", color: "var(--color-green)" },
  "Like New": { bg: "#e6f0ff", color: "var(--color-info)" },
  Good: { bg: "var(--color-green-light)", color: "var(--color-green-dark)" },
  Used: { bg: "#fef3cd", color: "#7a5a00" },
  Refurbished: { bg: "#ede9fe", color: "#5b21b6" },
  Fair: { bg: "#fef3cd", color: "#7a5a00" },
  "For Parts": { bg: "#fee2e2", color: "var(--color-error)" },
};

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════ */

function HeroCarousel({ onCTAClick }) {
  const [cur, setCur] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback(
    (next) => {
      if (fading) return;
      setFading(true);
      setTimeout(() => {
        setCur(next);
        setFading(false);
      }, 340);
    },
    [fading],
  );

  useEffect(() => {
    const t = setInterval(() => go((cur + 1) % HERO_SLIDES.length), 4600);
    return () => clearInterval(t);
  }, [cur, go]);

  const s = HERO_SLIDES[cur];

  return (
    <div className="sc-car">
      {HERO_SLIDES.map((sl, i) => (
        <div key={i} className={`sc-car-slide${i === cur ? " a" : ""}`}>
          <img src={sl.img} alt="" className="sc-car-img" />
          <div className="sc-car-ov" />
        </div>
      ))}
      <div className="sc-car-content" style={{ opacity: fading ? 0 : 1 }}>
        <span className="sc-car-tag">{s.tag}</span>
        <h2 className="sc-car-title">{s.title}</h2>
        <p className="sc-car-sub">{s.sub}</p>
        <button className="sc-car-cta" onClick={onCTAClick}>
          {s.cta} <ArrowRight size={12} />
        </button>
      </div>
      <button
        className="sc-car-btn sc-car-prev"
        onClick={() => go((cur - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        aria-label="Prev"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        className="sc-car-btn sc-car-next"
        onClick={() => go((cur + 1) % HERO_SLIDES.length)}
        aria-label="Next"
      >
        <ChevronRight size={14} />
      </button>
      <div className="sc-car-dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`sc-car-dot${i === cur ? " on" : ""}`}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedTitle() {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVis(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ANIMATED_WORDS.length);
        setVis(true);
      }, 280);
    }, 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <h2 className="sc-hero-title">
      Devices worth{" "}
      <em
        className="sc-word"
        style={{
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {ANIMATED_WORDS[idx]}
      </em>
    </h2>
  );
}

function TrustBar({ total }) {
  const items = [
    { Icon: ShieldCheck, val: "100%", label: "Verified sellers" },
    { Icon: Eye, val: total > 0 ? `${total}+` : "—", label: "Live listings" },
    { Icon: TrendingUp, val: "50+", label: "Weekly sales" },
    { Icon: Zap, val: "< 2h", label: "Avg response" },
  ];
  return (
    <div className="sc-trust">
      {items.map(({ Icon, val, label }) => (
        <div key={label} className="sc-trust-item">
          <Icon size={13} strokeWidth={2} className="sc-trust-icon" />
          <span className="sc-trust-val">{val}</span>
          <span className="sc-trust-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Ticker({ items }) {
  const deals = items
    .filter((p) => p.oldPrice && p.price < p.oldPrice)
    .slice(0, 6);
  if (!deals.length) return null;
  const all = [...deals, ...deals];
  return (
    <div className="sc-ticker">
      <span className="sc-ticker-label">
        <Flame size={10} fill="currentColor" /> Hot deals
      </span>
      <div className="sc-ticker-track">
        <div className="sc-ticker-inner">
          {all.map((p, i) => (
            <span key={i} className="sc-ticker-item">
              {p.brand} {p.name} ·{" "}
              <strong>KES {p.price?.toLocaleString()}</strong>
              <span className="sc-ticker-was">
                {" "}
                was {p.oldPrice?.toLocaleString()}
              </span>
              &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="sc-card sc-skel" aria-hidden>
      <div className="sc-img-wrap sc-skel-block" />
      <div className="sc-card-body">
        <div className="sc-skel-line" style={{ width: "38%" }} />
        <div
          className="sc-skel-line"
          style={{ width: "78%", height: 13, marginTop: 6 }}
        />
        <div className="sc-skel-line" style={{ width: "52%", marginTop: 10 }} />
      </div>
    </div>
  );
}

function ProductCard({ p, index }) {
  const navigate = useNavigate();
  const cond = COND_CHIP[p.condition] || COND_CHIP["Used"];
  const discount =
    p.oldPrice && p.price < p.oldPrice
      ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
      : null;

  return (
    <article
      className="sc-card"
      style={{ "--i": index }}
      onClick={() => navigate(`/product/${p._id}`)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${p._id}`)}
      aria-label={`${p.name} — KES ${p.price?.toLocaleString()}`}
    >
      <div className="sc-img-wrap">
        <img
          src={p.images?.[0] || FALLBACK}
          alt={p.name}
          className="sc-card-img"
          draggable={false}
          onError={(e) => {
            e.target.src = FALLBACK;
          }}
        />
        <div className="sc-badge-row">
          {p.verified && (
            <span className="sc-badge sc-badge-v">
              <ShieldCheck size={9} strokeWidth={2.5} /> Verified
            </span>
          )}
          {discount && (
            <span className="sc-badge sc-badge-d">-{discount}%</span>
          )}
        </div>
        <span
          className="sc-cond-chip"
          style={{ background: cond.bg, color: cond.color }}
        >
          {p.condition}
        </span>
        <div className="sc-ov">
          <span className="sc-ov-cta">View details</span>
        </div>
      </div>

      <div className="sc-card-body">
        <p className="sc-brand">{p.brand}</p>
        <h3 className="sc-name">{p.name}</h3>
        {p.rating > 0 && (
          <div className="sc-stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`sc-star${i <= Math.round(p.rating) ? " on" : ""}`}
              >
                ★
              </span>
            ))}
            <span className="sc-rating">{p.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="sc-price-row">
          <span className="sc-price">KES {p.price?.toLocaleString()}</span>
          {p.oldPrice && (
            <span className="sc-old-price">
              KES {p.oldPrice?.toLocaleString()}
            </span>
          )}
        </div>
        {p.location && <p className="sc-loc">📍 {p.location}</p>}
      </div>

      <div className="sc-arrow">
        <ChevronRight size={13} />
      </div>
    </article>
  );
}

function CategoryRow({
  label,
  Icon,
  badge,
  items,
  loading,
  onToggle,
  expanded,
}) {
  return (
    <div className="sc-row">
      <div className="sc-row-hdr">
        <div className="sc-row-left">
          <span className="sc-row-pill">
            <Icon size={12} strokeWidth={2.5} />
            {label}
          </span>
          {badge && <span className="sc-row-badge">{badge}</span>}
        </div>
        {!loading && items.length > 0 && (
          <button className="sc-more" onClick={onToggle}>
            {expanded ? "Show less" : `Show all ${items.length}`}{" "}
            <ChevronRight size={11} />
          </button>
        )}
      </div>

      {/* Desktop */}
      <div className="sc-grid-d">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <p className="sc-empty">No {label.toLowerCase()} listed right now.</p>
        ) : (
          items.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)
        )}
      </div>

      {/* Mobile scroll */}
      <div className="sc-grid-m">
        <div className="sc-scroll-inner">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="sc-scroll-col">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ))
            : (() => {
                const cols = [];
                for (let i = 0; i < items.length; i += 2) {
                  cols.push(
                    <div key={i} className="sc-scroll-col">
                      <ProductCard p={items[i]} index={i} />
                      {items[i + 1] && (
                        <ProductCard p={items[i + 1]} index={i + 1} />
                      )}
                    </div>,
                  );
                }
                return cols;
              })()}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */

export default function MarketplaceShowcase() {
  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllLaptops, setShowAllLaptops] = useState(false);
  const [showAllPhones, setShowAllPhones] = useState(false);

  useEffect(() => {
    getAllListings({ limit: 100, page: 1 })
      .then((res) => setAll(shuffle(res.data || [])))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const laptops = all.filter((p) => classify(p) === "laptop");
  const phones = all.filter((p) => classify(p) === "phone");
  const visLaptops = showAllLaptops ? laptops : laptops.slice(0, 4);
  const visPhones = showAllPhones ? phones : phones.slice(0, 4);

  return (
    <>
      <style>{`
        /* ── All tokens come from :root in your global CSS ── */

        .sc-section {
          background: var(--color-beige);
          font-family: var(--font-body);
          overflow: hidden;
        }

        /* HERO */
        .sc-hero { display: grid; grid-template-columns: 1fr; }
        @media(min-width:768px) {
          .sc-hero { grid-template-columns: 46% 54%; min-height: 360px; }
        }

        .sc-hero-left {
          position: relative; z-index: 0;
          background: var(--color-black);
          padding: 40px 30px 36px;
          display: flex; flex-direction: column; justify-content: center; gap: 14px;
          overflow: hidden;
        }
        .sc-hero-left::before {
          content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,95,2,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,95,2,.08) 1px, transparent 1px);
          background-size: 34px 34px;
        }
        .sc-hero-left::after {
          content: ''; position: absolute;
          width: 340px; height: 340px;
          background: radial-gradient(circle, rgba(0,95,2,.28) 0%, transparent 68%);
          top: -90px; right: -80px; pointer-events: none; z-index: 0;
          animation: sc-orb 9s ease-in-out infinite;
        }
        @keyframes sc-orb {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-22px,22px) scale(1.08); }
        }

        .sc-eyebrow {
          position: relative; z-index: 1;
          font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
          color: var(--color-green);
          font-family: var(--font-mono);
        }
        .sc-hero-title {
          position: relative; z-index: 1;
          font-family: var(--font-display);
          font-size: clamp(1.9rem, 3.8vw, 3.1rem);
          font-weight: 700; line-height: 1.05;
          color: var(--color-white); margin: 0; max-width: 15ch;
        }
        .sc-word {
          display: inline-block; font-style: italic; color: var(--color-green);
          transition: opacity .26s ease, transform .26s ease;
        }
        .sc-hero-sub {
          position: relative; z-index: 1;
          font-size: 12px; color: var(--color-white-muted);
          max-width: 34ch; line-height: 1.65; margin: 0;
          font-family: var(--font-body);
        }
        .sc-hero-cta {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--color-green); color: var(--color-white);
          border: none; padding: 11px 22px; border-radius: var(--radius-xl);
          font-family: var(--font-body); font-size: 12.5px; font-weight: 700;
          cursor: pointer; width: fit-content;
          transition: transform .22s ease, box-shadow .22s ease;
        }
        .sc-hero-cta:hover {
          transform: translateX(3px);
          box-shadow: 0 4px 18px rgba(0,95,2,.35);
        }

        /* CAROUSEL */
        .sc-hero-right { position: relative; overflow: hidden; min-height: 230px; }
        .sc-car { position: absolute; inset: 0; }
        .sc-car-slide { position: absolute; inset: 0; opacity: 0; transition: opacity .5s ease; }
        .sc-car-slide.a { opacity: 1; }
        .sc-car-img { width: 100%; height: 100%; object-fit: cover; }
        .sc-car-ov {
          position: absolute; inset: 0;
          background:
            linear-gradient(to right, rgba(13,17,23,.45) 0%, transparent 55%),
            linear-gradient(to top,   rgba(13,17,23,.6)  0%, transparent 50%);
        }
        .sc-car-content {
          position: absolute; bottom: 28px; left: 24px;
          display: flex; flex-direction: column; gap: 8px;
          transition: opacity .3s ease;
        }
        .sc-car-tag {
          font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: var(--color-white); background: var(--color-green);
          padding: 3px 10px; border-radius: var(--radius-xl); width: fit-content;
          font-family: var(--font-mono);
        }
        .sc-car-title {
          font-family: var(--font-display);
          font-size: clamp(1.4rem, 2.8vw, 2rem); font-weight: 700;
          color: var(--color-white); margin: 0; line-height: 1.1;
        }
        .sc-car-sub {
          font-size: 11px; color: rgba(255,255,255,.65); margin: 0;
          font-family: var(--font-body);
        }
        .sc-car-cta {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--color-white); border: 1.5px solid rgba(255,255,255,.45);
          background: rgba(255,255,255,.1); backdrop-filter: blur(6px);
          padding: 7px 16px; border-radius: var(--radius-xl);
          font-family: var(--font-body); font-size: 11px; font-weight: 600;
          cursor: pointer; width: fit-content;
          transition: background .22s ease, border-color .22s ease;
        }
        .sc-car-cta:hover { background: rgba(255,255,255,.22); border-color: rgba(255,255,255,.8); }
        .sc-car-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,.16); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.22);
          color: var(--color-white); cursor: pointer; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          transition: background .22s ease;
        }
        .sc-car-btn:hover { background: rgba(255,255,255,.32); }
        .sc-car-prev { left: 10px; } .sc-car-next { right: 10px; }
        .sc-car-dots {
          position: absolute; bottom: 10px; right: 16px;
          display: flex; gap: 5px; z-index: 2;
        }
        .sc-car-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,.32); border: none; cursor: pointer; padding: 0;
          transition: background .2s, transform .2s;
        }
        .sc-car-dot.on { background: var(--color-white); transform: scale(1.35); }

        /* TRUST BAR */
        .sc-trust {
          display: flex; align-items: center; justify-content: space-around;
          flex-wrap: wrap; gap: 8px;
          background: var(--color-black); padding: 12px 28px;
        }
        .sc-trust-item { display: flex; align-items: center; gap: 7px; }
        .sc-trust-icon { color: var(--color-green); flex-shrink: 0; }
        .sc-trust-val {
          font-family: var(--font-mono); font-size: 11px; font-weight: 700;
          color: var(--color-white-soft);
        }
        .sc-trust-label {
          font-size: 9.5px; color: var(--color-white-dim);
          text-transform: uppercase; letter-spacing: .07em;
          font-family: var(--font-body);
        }

        /* TICKER */
        .sc-ticker {
          display: flex; align-items: center; height: 32px;
          background: var(--color-green); overflow: hidden;
        }
        .sc-ticker-label {
          flex-shrink: 0; display: flex; align-items: center; gap: 5px;
          font-size: 9.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: var(--color-white); padding: 0 16px 0 14px;
          border-right: 1px solid rgba(255,255,255,.25); height: 100%;
          white-space: nowrap; font-family: var(--font-mono);
        }
        .sc-ticker-track { flex: 1; overflow: hidden; }
        .sc-ticker-inner {
          display: inline-flex; align-items: center; white-space: nowrap;
          animation: sc-tick 30s linear infinite;
          font-size: 10.5px; color: rgba(255,255,255,.75);
          padding: 0 20px; font-family: var(--font-body);
        }
        .sc-ticker-inner strong { color: var(--color-white); font-weight: 700; }
        .sc-ticker-was { text-decoration: line-through; color: rgba(255,255,255,.45); }
        @keyframes sc-tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* INNER */
        .sc-inner { max-width: 1280px; margin: 0 auto; padding: 28px 22px 52px; }

        /* ROW */
        .sc-row { margin-bottom: 36px; }
        .sc-row-hdr {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
        }
        .sc-row-left { display: flex; align-items: center; gap: 8px; }
        .sc-row-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--color-black); color: var(--color-white-soft);
          font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
          padding: 5px 13px 5px 10px; border-radius: var(--radius-xl);
          font-family: var(--font-body);
        }
        .sc-row-badge {
          font-size: 9px; font-weight: 700;
          background: #fef08a; color: #713f12;
          padding: 2px 9px; border-radius: var(--radius-xl);
          font-family: var(--font-mono);
        }
        .sc-more {
          display: inline-flex; align-items: center; gap: 4px;
          background: none; border: 1.5px solid var(--color-beige-dark);
          color: var(--color-beige-text); font-family: var(--font-body);
          font-size: 10.5px; font-weight: 600;
          padding: 5px 13px; border-radius: var(--radius-xl); cursor: pointer;
          transition: border-color .22s ease, color .22s ease;
        }
        .sc-more:hover { border-color: var(--color-black); color: var(--color-black); }

        /* DESKTOP GRID */
        .sc-grid-d { display: none; }
        @media(min-width:580px)  { .sc-grid-d { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; } }
        @media(min-width:860px)  { .sc-grid-d { grid-template-columns: repeat(3,1fr); } }
        @media(min-width:1100px) { .sc-grid-d { grid-template-columns: repeat(4,1fr); } }

        /* MOBILE SCROLL */
        .sc-grid-m {
          display: block; overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none; margin: 0 -22px; padding: 0 22px 4px;
        }
        .sc-grid-m::-webkit-scrollbar { display: none; }
        @media(min-width:580px) { .sc-grid-m { display: none; } }
        .sc-scroll-inner { display: flex; gap: 10px; width: max-content; padding-right: 22px; }
        .sc-scroll-col { display: flex; flex-direction: column; gap: 10px; width: 145px; flex-shrink: 0; }

        /* CARD */
        .sc-card {
          position: relative; background: var(--color-white);
          border: 1px solid var(--color-beige-dark); border-radius: var(--radius-lg);
          overflow: hidden; cursor: pointer;
          display: flex; flex-direction: column;
          box-shadow: 0 1px 4px rgba(13,17,23,.05), 0 4px 14px rgba(13,17,23,.04);
          animation: sc-fadein .4s ease both;
          animation-delay: calc(var(--i,0) * 55ms);
          transition: box-shadow .22s ease, border-color .22s ease, transform .22s ease;
          outline-offset: 3px;
        }
        .sc-card:hover, .sc-card:focus-visible {
          border-color: rgba(0,95,2,.3);
          box-shadow: 0 8px 30px rgba(13,17,23,.12);
          transform: translateY(-3px);
        }
        @keyframes sc-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sc-img-wrap {
          position: relative; aspect-ratio: 1;
          background: var(--color-beige-dark); overflow: hidden;
        }
        .sc-card-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform .5s cubic-bezier(.25,.46,.45,.94);
        }
        .sc-card:hover .sc-card-img { transform: scale(1.07); }

        .sc-badge-row {
          position: absolute; top: 7px; right: 7px;
          display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
        }
        .sc-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 8.5px; font-weight: 700; padding: 2px 7px;
          border-radius: var(--radius-xl); font-family: var(--font-mono);
        }
        .sc-badge-v {
          background: rgba(13,17,23,.82); backdrop-filter: blur(6px);
          color: var(--color-green); border: 1px solid rgba(0,95,2,.3);
        }
        .sc-badge-d { background: var(--color-error); color: var(--color-white); }

        .sc-cond-chip {
          position: absolute; bottom: 7px; left: 7px;
          font-size: 8px; font-weight: 700; padding: 2px 7px;
          border-radius: var(--radius-xl); font-family: var(--font-mono);
        }

        .sc-ov {
          position: absolute; inset: 0;
          background: rgba(13,17,23,0);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .22s ease, background .22s ease;
        }
        .sc-card:hover .sc-ov { opacity: 1; background: rgba(13,17,23,.1); }
        .sc-ov-cta {
          background: var(--color-black); color: var(--color-white-soft);
          font-size: 10px; font-weight: 700; letter-spacing: .03em;
          padding: 7px 16px; border-radius: var(--radius-xl);
          transform: translateY(5px); transition: transform .22s ease;
          font-family: var(--font-body);
        }
        .sc-card:hover .sc-ov-cta { transform: translateY(0); }

        .sc-card-body {
          padding: 10px 12px 28px; flex: 1;
          display: flex; flex-direction: column; gap: 3px;
        }
        .sc-brand {
          font-size: 8.5px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: var(--color-beige-text);
          margin: 0; font-family: var(--font-mono);
        }
        .sc-name {
          font-family: var(--font-display); font-size: 13px; line-height: 1.22;
          color: var(--color-black); margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .sc-stars { display: flex; align-items: center; gap: 1px; margin-top: 2px; }
        .sc-star { font-size: 10px; color: var(--color-beige-dark); }
        .sc-star.on { color: var(--color-warning); }
        .sc-rating { font-size: 9px; color: var(--color-beige-text); margin-left: 3px; font-family: var(--font-mono); }
        .sc-price-row { display: flex; align-items: baseline; gap: 6px; margin-top: 6px; }
        .sc-price { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--color-black); }
        .sc-old-price { font-family: var(--font-mono); font-size: 9px; color: var(--color-beige-text); text-decoration: line-through; }
        .sc-loc { font-size: 9px; color: var(--color-beige-text); margin: 2px 0 0; font-family: var(--font-body); }

        .sc-arrow {
          position: absolute; bottom: 9px; right: 9px;
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--color-beige); display: flex; align-items: center; justify-content: center;
          color: var(--color-black); opacity: 0; transform: translateX(-4px);
          transition: opacity .22s ease, transform .22s ease;
        }
        .sc-card:hover .sc-arrow, .sc-card:focus-visible .sc-arrow {
          opacity: 1; transform: translateX(0);
        }

        /* SKELETON */
        .sc-skel { pointer-events: none; }
        .sc-skel-block {
          background: linear-gradient(90deg, var(--color-beige-dark) 25%, var(--color-beige) 50%, var(--color-beige-dark) 75%);
          background-size: 200% 100%; animation: sc-shim 1.5s infinite;
        }
        .sc-skel-line {
          height: 8px; border-radius: var(--radius-sm); margin: 4px 12px 0;
          background: linear-gradient(90deg, var(--color-beige-dark) 25%, var(--color-beige) 50%, var(--color-beige-dark) 75%);
          background-size: 200% 100%; animation: sc-shim 1.5s infinite;
        }
        @keyframes sc-shim { to { background-position: -200% 0; } }
        .sc-empty {
          grid-column: 1/-1; font-size: 12px; color: var(--color-beige-text);
          padding: 32px 0; text-align: center; font-family: var(--font-body);
        }

        /* DIVIDER */
        .sc-divider {
          height: 1px;
          background: linear-gradient(to right, var(--color-green), transparent);
          margin: 4px 0 32px;
        }
      `}</style>

      <section className="sc-section">
        {/* HERO */}
        <div className="sc-hero">
          <div className="sc-hero-left">
            <span className="sc-eyebrow">Marketplace · Nairobi</span>
            <AnimatedTitle />
            <p className="sc-hero-sub">
              Curated laptops &amp; smartphones from verified sellers across
              Kenya. Every listing hand-checked before going live.
            </p>
            <button
              className="sc-hero-cta"
              onClick={() => navigate("/marketplace")}
            >
              Browse all listings <ArrowRight size={13} />
            </button>
          </div>
          <div className="sc-hero-right">
            <HeroCarousel onCTAClick={() => navigate("/marketplace")} />
          </div>
        </div>

        {/* TRUST BAR */}
        <TrustBar total={all.length} />

        {/* TICKER */}
        <Ticker items={all} />

        {/* PRODUCT ROWS */}
        <div className="sc-inner">
          <CategoryRow
            label="Laptops"
            Icon={Laptop}
            badge={laptops.length > 0 ? `${laptops.length} listed` : undefined}
            items={visLaptops}
            loading={loading}
            onToggle={() => setShowAllLaptops((v) => !v)}
            expanded={showAllLaptops}
          />

          <div className="sc-divider" />

          <CategoryRow
            label="Smartphones"
            Icon={Smartphone}
            badge={phones.length > 0 ? `${phones.length} listed` : undefined}
            items={visPhones}
            loading={loading}
            onToggle={() => setShowAllPhones((v) => !v)}
            expanded={showAllPhones}
          />
        </div>
      </section>
    </>
  );
}
