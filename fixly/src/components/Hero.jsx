import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Wrench,
  ShoppingBag,
} from "lucide-react";

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "laptop-sale",
    type: "marketplace",
    eyebrow: "Marketplace · Laptops",
    headline: "Power your hustle.",
    sub: "Verified refurbished & new laptops — Nairobi prices, zero compromise.",
    cta: "Browse laptops",
    ctaRoute: "/marketplace?tab=laptops",
    accent: "#f97316",
    accentMuted: "rgba(249,115,22,0.15)",
    bg: "#0d1117",
    patternColor: "rgba(249,115,22,0.06)",
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=80",
    badge: "Buy",
    badgeBg: "#f97316",
  },
  {
    id: "phone-sale",
    type: "marketplace",
    eyebrow: "Marketplace · Phones",
    headline: "Your next phone is here.",
    sub: "Curated smartphones from trusted Nairobi sellers. Every listing verified.",
    cta: "Shop phones",
    ctaRoute: "/marketplace?tab=phones",
    accent: "#06b6d4",
    accentMuted: "rgba(6,182,212,0.15)",
    bg: "#0a0f1e",
    patternColor: "rgba(6,182,212,0.06)",
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=80",
    badge: "Buy",
    badgeBg: "#06b6d4",
  },
  {
    id: "phone-repair",
    type: "repair",
    eyebrow: "Repairs · Phones",
    headline: "Cracked screen? We fix fast.",
    sub: "Same-day phone repairs by verified technicians. 90-day warranty on every job.",
    cta: "Book phone repair",
    ctaRoute: "/?device=phone",
    accent: "#22c55e",
    accentMuted: "rgba(34,197,94,0.15)",
    bg: "#061409",
    patternColor: "rgba(34,197,94,0.06)",
    img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=900&auto=format&fit=crop&q=80",
    badge: "Repair",
    badgeBg: "#22c55e",
  },
  {
    id: "laptop-repair",
    type: "repair",
    eyebrow: "Repairs · Laptops",
    headline: "Dead laptop? Back in hours.",
    sub: "Expert diagnostics, same-day fixes, genuine parts. Starting from KSh 4,000.",
    cta: "Book laptop repair",
    ctaRoute: "/?device=laptop",
    accent: "#a855f7",
    accentMuted: "rgba(168,85,247,0.15)",
    bg: "#0d0814",
    patternColor: "rgba(168,85,247,0.06)",
    img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900&auto=format&fit=crop&q=80",
    badge: "Repair",
    badgeBg: "#a855f7",
  },
];

const TRUST_ITEMS = [
  { val: "12,400+", label: "Customers served" },
  { val: "90-day", label: "Repair warranty" },
  { val: "2 hrs", label: "Avg screen repair" },
  { val: "100%", label: "Verified sellers" },
];

// ─── Slide thumbnail nav ───────────────────────────────────────────────────────
function SlidePip({ slide, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 8,
        border: `1.5px solid ${active ? slide.accent : "rgba(255,255,255,0.12)"}`,
        background: active ? `${slide.accent}18` : "transparent",
        cursor: "pointer",
        transition: "all 0.25s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: active ? slide.accent : "rgba(255,255,255,0.3)",
          flexShrink: 0,
          transition: "background 0.25s ease",
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: active ? slide.accent : "rgba(255,255,255,0.45)",
          fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
          whiteSpace: "nowrap",
          transition: "color 0.25s ease",
        }}
      >
        {slide.badge}
        {" · "}
        {slide.id.includes("laptop") ? "Laptops" : "Phones"}
      </span>
    </button>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export default function Hero() {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({});
  const intervalRef = useRef(null);

  const slide = SLIDES[cur];

  const go = (next) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCur((next + SLIDES.length) % SLIDES.length);
      setAnimating(false);
    }, 320);
  };

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => go(cur + 1), 5000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(
      () => setCur((c) => (c + 1) % SLIDES.length),
      5000,
    );
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleNav = (dir) => {
    resetInterval();
    go(cur + dir);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .fh-root {
          font-family: var(--font-body, 'DM Sans', sans-serif);
          overflow: hidden;
        }

        /* ── MAIN STAGE ── */
        .fh-stage {
          position: relative;
          height: clamp(380px, 52vw, 560px);
          overflow: hidden;
        }

        /* background slides */
        .fh-bg {
          position: absolute;
          inset: 0;
          transition: opacity 0.38s ease;
        }
        .fh-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .fh-bg-ov {
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.2) 100%);
        }
        .fh-bg-pat {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* orb glow */
        .fh-orb {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          top: -100px;
          right: -60px;
          pointer-events: none;
          transition: background 0.5s ease;
          animation: fh-orb-pulse 8s ease-in-out infinite;
        }
        @keyframes fh-orb-pulse {
          0%,100% { transform: scale(1) translate(0,0); }
          50%      { transform: scale(1.1) translate(-20px, 20px); }
        }

        /* ── CONTENT ── */
        .fh-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          padding: 0 clamp(24px, 5vw, 72px);
          transition: opacity 0.32s ease, transform 0.32s ease;
        }
        .fh-content-inner {
          max-width: 580px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .fh-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          font-family: var(--font-mono, monospace);
        }
        .fh-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: fh-blink 2s ease-in-out infinite;
        }
        @keyframes fh-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .fh-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: white;
          width: fit-content;
          font-family: var(--font-mono, monospace);
        }

        .fh-headline {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(2rem, 5vw, 3.8rem);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.04;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .fh-headline em {
          font-style: normal;
          transition: color 0.4s ease;
        }

        .fh-sub {
          font-size: clamp(13px, 1.6vw, 15px);
          color: rgba(255,255,255,0.6);
          line-height: 1.65;
          margin: 0;
          max-width: 38ch;
        }

        .fh-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: white;
          border: none;
          cursor: pointer;
          width: fit-content;
          transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
          font-family: var(--font-body, 'DM Sans', sans-serif);
        }
        .fh-cta:hover {
          transform: translateX(4px);
          filter: brightness(1.12);
        }
        .fh-cta svg { transition: transform 0.22s ease; }
        .fh-cta:hover svg { transform: translateX(3px); }

        .fh-cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          border: 1.5px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.07);
          cursor: pointer;
          backdrop-filter: blur(6px);
          transition: all 0.22s ease;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          text-decoration: none;
        }
        .fh-cta-ghost:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.4);
          color: white;
        }
        .fh-cta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* ── ARROWS ── */
        .fh-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.22s ease;
          z-index: 10;
        }
        .fh-arrow:hover { background: rgba(255,255,255,0.22); }
        .fh-arrow-l { left: 18px; }
        .fh-arrow-r { right: 18px; }

        /* ── SLIDE COUNTER ── */
        .fh-counter {
          position: absolute;
          top: 20px;
          right: 24px;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          z-index: 10;
          letter-spacing: 0.08em;
        }
        .fh-counter strong { color: rgba(255,255,255,0.8); }

        /* ── BOTTOM NAV BAR ── */
        .fh-nav-bar {
          background: #0d1117;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 0 clamp(24px, 5vw, 72px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
          height: 54px;
          flex-shrink: 0;
        }
        .fh-nav-bar::-webkit-scrollbar { display: none; }

        .fh-nav-pips {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .fh-progress-bar {
          flex: 1;
          height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
          max-width: 120px;
          flex-shrink: 0;
        }
        .fh-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.1s linear, background 0.3s ease;
          animation: fh-prog 5s linear infinite;
        }
        @keyframes fh-prog { from{width:0%} to{width:100%} }

        /* ── TRUST BAR ── */
        .fh-trust {
          background: #f5f0e8;
          border-top: 1px solid #e8e0d0;
          display: flex;
          align-items: stretch;
          overflow: hidden;
        }
        .fh-trust-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 3px;
          padding: 14px 12px;
          border-right: 1px solid #e8e0d0;
          min-width: 0;
        }
        .fh-trust-item:last-child { border-right: none; }
        .fh-trust-val {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: 17px;
          font-weight: 800;
          color: #0d1117;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .fh-trust-label {
          font-size: 10px;
          color: #8a7f72;
          font-weight: 500;
          text-align: center;
          white-space: nowrap;
          font-family: var(--font-body, 'DM Sans', sans-serif);
        }

        /* ── TYPE TAG on content area ── */
        .fh-type-tag {
          position: absolute;
          top: 20px;
          left: clamp(24px, 5vw, 72px);
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
        }

        @media (max-width: 600px) {
          .fh-headline { font-size: 1.8rem; }
          .fh-stage { height: 340px; }
          .fh-trust-val { font-size: 14px; }
          .fh-trust-label { font-size: 9px; }
          .fh-trust-item { padding: 12px 8px; }
        }
      `}</style>

      <div className="fh-root">
        {/* ── MAIN STAGE ── */}
        <div className="fh-stage">
          {/* Preload all images */}
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className="fh-bg"
              style={{ opacity: i === cur ? 1 : 0, zIndex: i === cur ? 1 : 0 }}
            >
              <img
                src={s.img}
                alt=""
                className="fh-bg-img"
                onLoad={() => setImgLoaded((p) => ({ ...p, [s.id]: true }))}
              />
              <div className="fh-bg-ov" />
              {/* Grid pattern */}
              <svg className="fh-bg-pat" width="100%" height="100%">
                <defs>
                  <pattern
                    id={`grid-${s.id}`}
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke={s.patternColor}
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${s.id})`} />
              </svg>
              {/* Orb */}
              <div
                className="fh-orb"
                style={{
                  background: `radial-gradient(circle, ${s.accentMuted} 0%, transparent 70%)`,
                }}
              />
            </div>
          ))}

          {/* Type tag top-left */}
          <div className="fh-type-tag">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.9)",
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${slide.accent}55`,
                padding: "4px 12px",
                borderRadius: 100,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {slide.type === "repair" ? (
                <Wrench size={10} style={{ color: slide.accent }} />
              ) : (
                <ShoppingBag size={10} style={{ color: slide.accent }} />
              )}
              Fixly · {slide.type === "repair" ? "Repairs" : "Marketplace"}
            </span>
          </div>

          {/* Slide counter */}
          <div className="fh-counter">
            <strong>{String(cur + 1).padStart(2, "0")}</strong> /{" "}
            {String(SLIDES.length).padStart(2, "0")}
          </div>

          {/* Content */}
          <div
            className="fh-content"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? "translateX(18px)" : "translateX(0)",
              zIndex: 5,
            }}
          >
            <div className="fh-content-inner">
              {/* Badge */}
              <div>
                <span
                  className="fh-badge"
                  style={{
                    background:
                      slide.badge === "Repair"
                        ? `${slide.accent}22`
                        : `${slide.accent}22`,
                    color: slide.accent,
                    border: `1px solid ${slide.accent}44`,
                  }}
                >
                  {slide.type === "repair" ? (
                    <Wrench size={10} />
                  ) : (
                    <ShoppingBag size={10} />
                  )}
                  {slide.badge}
                </span>
              </div>

              {/* Eyebrow */}
              <div className="fh-eyebrow">
                <span
                  className="fh-eyebrow-dot"
                  style={{ background: slide.accent }}
                />
                {slide.eyebrow}
              </div>

              {/* Headline */}
              <h1 className="fh-headline">
                <em style={{ color: slide.accent }}>
                  {slide.headline.split(" ")[0]}{" "}
                </em>
                {slide.headline.slice(slide.headline.indexOf(" ") + 1)}
              </h1>

              {/* Sub */}
              <p className="fh-sub">{slide.sub}</p>

              {/* CTAs */}
              <div className="fh-cta-row">
                <button
                  className="fh-cta"
                  style={{ background: slide.accent }}
                  onClick={() => navigate(slide.ctaRoute)}
                >
                  {slide.cta}
                  <ArrowRight size={14} />
                </button>
                <button
                  className="fh-cta-ghost"
                  onClick={() =>
                    navigate(slide.type === "repair" ? "/" : "/marketplace")
                  }
                >
                  {slide.type === "repair"
                    ? "View all repairs"
                    : "All listings"}
                </button>
              </div>
            </div>
          </div>

          {/* Arrows */}
          <button className="fh-arrow fh-arrow-l" onClick={() => handleNav(-1)}>
            <ChevronLeft size={16} />
          </button>
          <button className="fh-arrow fh-arrow-r" onClick={() => handleNav(1)}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── BOTTOM NAV BAR ── */}
        <div className="fh-nav-bar">
          <div className="fh-nav-pips">
            {SLIDES.map((s, i) => (
              <SlidePip
                key={s.id}
                slide={s}
                active={i === cur}
                onClick={() => {
                  resetInterval();
                  go(i);
                }}
              />
            ))}
          </div>
          <div className="fh-progress-bar">
            <div
              key={cur}
              className="fh-progress-fill"
              style={{ background: slide.accent }}
            />
          </div>
        </div>

        {/* ── TRUST BAR ── */}
        <div className="fh-trust">
          {TRUST_ITEMS.map(({ val, label }) => (
            <div key={label} className="fh-trust-item">
              <span className="fh-trust-val">{val}</span>
              <span className="fh-trust-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
