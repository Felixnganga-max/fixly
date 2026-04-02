import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Laptop,
  Smartphone,
  ChevronLeft,
} from "lucide-react";
import { getAllListings } from "../Hooks/marketplaceApi";

/* ─── helpers ─────────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LAPTOP_KEYS = [
  "laptop",
  "macbook",
  "notebook",
  "chromebook",
  "thinkpad",
  "dell",
  "hp",
  "lenovo",
  "asus",
  "acer",
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
];

function classify(p) {
  const h = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
  if (LAPTOP_KEYS.some((k) => h.includes(k))) return "laptop";
  if (PHONE_KEYS.some((k) => h.includes(k))) return "phone";
  return "other";
}

/* ─── hero carousel ────────────────────────────────────────── */
// Replace these 3 URLs with your own images when ready
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop&q=80",
];

function HeroCarousel() {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCur((i) => (i + 1) % HERO_IMAGES.length),
      3500,
    );
    return () => clearInterval(t);
  }, []);

  const prev = () =>
    setCur((i) => (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  const next = () => setCur((i) => (i + 1) % HERO_IMAGES.length);

  return (
    <div className="mks-carousel">
      <div className="mks-carousel-track">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="mks-carousel-img"
            style={{
              opacity: i === cur ? 1 : 0,
              transform: i === cur ? "scale(1)" : "scale(1.04)",
            }}
          />
        ))}
      </div>
      <button
        className="mks-car-btn mks-car-prev"
        onClick={prev}
        aria-label="Previous"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        className="mks-car-btn mks-car-next"
        onClick={next}
        aria-label="Next"
      >
        <ChevronRight size={14} />
      </button>
      <div className="mks-car-dots">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            className={`mks-car-dot${i === cur ? " active" : ""}`}
            onClick={() => setCur(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── animated word reveal ─────────────────────────────────── */
function AnimatedTitle() {
  const words = ["owning.", "loving.", "keeping.", "flipping."];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setVisible(true);
      }, 300);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <h2 className="mks-hero-title">
      Devices worth{" "}
      <em
        className="mks-word-swap"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
        }}
      >
        {words[idx]}
      </em>
    </h2>
  );
}

/* ─── skeleton card ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="mks-card mks-skeleton" aria-hidden="true">
      <div className="mks-img-wrap mks-skel-block" />
      <div className="mks-info">
        <div className="mks-skel-line mks-skel-short" />
        <div className="mks-skel-line mks-skel-long" />
        <div className="mks-skel-line mks-skel-mid" />
      </div>
    </div>
  );
}

/* ─── product card ─────────────────────────────────────────── */
function ProductCard({ p, index }) {
  const navigate = useNavigate();
  return (
    <article
      className="mks-card"
      style={{ "--i": index }}
      onClick={() => navigate(`/product/${p._id}`)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${p._id}`)}
      aria-label={`${p.name} — KES ${p.price?.toLocaleString()}`}
    >
      <div className="mks-img-wrap">
        <img
          src={p.images?.[0] || ""}
          alt={p.name}
          className="mks-img"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80";
          }}
        />
        {p.verified && (
          <span className="mks-badge">
            <ShieldCheck size={10} strokeWidth={2.5} /> Verified
          </span>
        )}
        <div className="mks-shine" />
      </div>
      <div className="mks-info">
        <p className="mks-brand">{p.brand}</p>
        <h3 className="mks-name">{p.name}</h3>
        <div className="mks-foot">
          <span className="mks-price">KES {p.price?.toLocaleString()}</span>
          <span className="mks-cond">{p.condition}</span>
        </div>
      </div>
      <div className="mks-arrow">
        <ChevronRight size={13} />
      </div>
    </article>
  );
}

/* ─── category row ─────────────────────────────────────────── */
function CategoryRow({
  label,
  icon: Icon,
  items,
  loading,
  skeletonCount = 4,
  onShowMore,
  allShown,
}) {
  return (
    <div className="mks-row">
      <div className="mks-row-header">
        <span className="mks-row-pill">
          <Icon size={12} strokeWidth={2.5} />
          {label}
        </span>
        {!loading && items.length > 0 && (
          <button className="mks-more-btn" onClick={onShowMore}>
            {allShown ? "Show less" : "Show more"} <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Desktop grid */}
      <div className="mks-grid-desktop">
        {loading
          ? [...Array(skeletonCount)].map((_, i) => <SkeletonCard key={i} />)
          : items.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}
        {!loading && items.length === 0 && (
          <p className="mks-empty">
            No {label.toLowerCase()} listed right now.
          </p>
        )}
      </div>

      {/* Mobile 2-row horizontal scroll */}
      <div className="mks-grid-mobile">
        <div className="mks-scroll-inner">
          {loading
            ? [...Array(skeletonCount)].map((_, i) => (
                <div key={i} className="mks-scroll-col">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ))
            : (() => {
                const cols = [];
                for (let i = 0; i < items.length; i += 2) {
                  cols.push(
                    <div key={i} className="mks-scroll-col">
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

/* ─── main ─────────────────────────────────────────────────── */
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@600&display=swap');

        :root {
          --mks-bg:      #F7F5F0;
          --mks-surface: #FFFFFF;
          --mks-border:  #E8E4DC;
          --mks-ink:     #0D0F0A;
          --mks-muted:   #8A8A82;
          --mks-accent:  #1A6B3C;
          --mks-radius:  14px;
          --mks-font-d:  'DM Serif Display', Georgia, serif;
          --mks-font-b:  'DM Sans', system-ui, sans-serif;
          --mks-font-m:  'JetBrains Mono', monospace;
          --mks-sh:      0 2px 10px rgba(13,15,10,.07);
          --mks-sh-h:    0 6px 24px rgba(13,15,10,.13);
        }

        .mks-section {
          background: var(--mks-bg);
          padding: 0 0 40px;
          font-family: var(--mks-font-b);
          overflow: hidden;
        }

        /* ── hero split layout ──────────────────── */
        .mks-hero {
          display: grid;
          grid-template-columns: 1fr;
          overflow: hidden;
        }
        @media (min-width: 768px) {
          .mks-hero { grid-template-columns: 1fr 1fr; min-height: 320px; }
        }

        .mks-hero-left {
          position: relative;
          padding: 28px 24px 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
          overflow: hidden;
          isolation: isolate;
        }

        /* orbs */
        .mks-orb-wrap { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .mks-orb { position: absolute; border-radius: 50%; filter: blur(50px); will-change: transform; }
        .mks-orb-1 {
          width: 280px; height: 280px;
          background: rgba(200,240,77,.20);
          top: -70px; right: -50px;
          animation: mks-f1 9s ease-in-out infinite;
        }
        .mks-orb-2 {
          width: 180px; height: 180px;
          background: rgba(26,107,60,.12);
          bottom: -30px; left: 10px;
          animation: mks-f2 11s ease-in-out infinite;
        }
        @keyframes mks-f1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-18px,12px) scale(1.06)} }
        @keyframes mks-f2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(14px,-18px)} }

        .mks-hero-eyebrow {
          position: relative; z-index: 1;
          font-family: var(--mks-font-m);
          font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase;
          color: var(--mks-accent);
          background: rgba(26,107,60,.09);
          border: 1px solid rgba(26,107,60,.20);
          padding: 3px 9px; border-radius: 100px; width: fit-content;
        }
        .mks-hero-title {
          position: relative; z-index: 1;
          font-family: var(--mks-font-d);
          font-size: clamp(1.75rem, 3.8vw, 2.9rem);
          font-weight: 400; line-height: 1.08;
          color: var(--mks-ink); margin: 0; max-width: 16ch;
        }
        .mks-word-swap {
          display: inline-block;
          font-style: italic; color: var(--mks-accent);
          transition: opacity .28s ease, transform .28s ease;
        }
        .mks-hero-sub {
          position: relative; z-index: 1;
          font-size: 12.5px; color: var(--mks-muted);
          max-width: 36ch; line-height: 1.55; margin: 0;
        }
        .mks-hero-cta {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 7px;
          width: fit-content;
          background: var(--mks-ink); color: #fff;
          border: none; padding: 9px 18px; border-radius: 100px;
          font-family: var(--mks-font-b); font-size: 12.5px; font-weight: 500;
          cursor: pointer; transition: background .2s, transform .15s;
        }
        .mks-hero-cta:hover { background: var(--mks-accent); transform: translateX(2px); }

        /* ── carousel ───────────────────────────── */
        .mks-hero-right {
          position: relative; overflow: hidden; min-height: 200px;
        }
        @media (min-width: 768px) { .mks-hero-right { min-height: unset; } }

        .mks-carousel { position: absolute; inset: 0; overflow: hidden; }
        .mks-carousel-track { position: relative; width: 100%; height: 100%; }
        .mks-carousel-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity .6s ease, transform .6s ease;
        }
        .mks-car-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,.85);
          border: 1px solid rgba(0,0,0,.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--mks-ink); z-index: 2;
          transition: background .15s;
        }
        .mks-car-btn:hover { background: #fff; }
        .mks-car-prev { left: 8px; }
        .mks-car-next { right: 8px; }
        .mks-car-dots {
          position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 5px; z-index: 2;
        }
        .mks-car-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,.5); border: none; cursor: pointer;
          transition: background .2s, transform .2s; padding: 0;
        }
        .mks-car-dot.active { background: #fff; transform: scale(1.3); }

        /* ── inner ──────────────────────────────── */
        .mks-inner { max-width: 1200px; margin: 0 auto; padding: 20px 20px 0; }

        /* ── row ────────────────────────────────── */
        .mks-row { margin-bottom: 24px; }
        .mks-row-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 10px;
        }
        .mks-row-pill {
          display: flex; align-items: center; gap: 6px;
          background: #0D0F0A; color: #F7F5F0;
          font-size: 10px; font-weight: 600;
          letter-spacing: .06em; text-transform: uppercase;
          padding: 4px 11px 4px 8px; border-radius: 100px;
        }
        .mks-more-btn {
          display: flex; align-items: center; gap: 4px;
          background: none; border: 1.5px solid var(--mks-border);
          color: var(--mks-muted); font-family: var(--mks-font-b);
          font-size: 10.5px; font-weight: 500;
          padding: 4px 11px; border-radius: 100px; cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .mks-more-btn:hover { border-color: var(--mks-ink); color: var(--mks-ink); }

        /* ── desktop grid ───────────────────────── */
        .mks-grid-desktop { display: none; }
        @media (min-width: 640px) {
          .mks-grid-desktop { display: grid; grid-template-columns: repeat(2,1fr); gap: 11px; }
        }
        @media (min-width: 900px)  { .mks-grid-desktop { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1100px) { .mks-grid-desktop { grid-template-columns: repeat(4,1fr); } }

        /* ── mobile scroll ──────────────────────── */
        .mks-grid-mobile { display: block; }
        @media (min-width: 640px) { .mks-grid-mobile { display: none; } }
        .mks-grid-mobile {
          overflow-x: auto; overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          margin: 0 -20px; padding: 0 20px 6px;
        }
        .mks-grid-mobile::-webkit-scrollbar { display: none; }
        .mks-scroll-inner { display: flex; gap: 9px; width: max-content; padding-right: 20px; }
        .mks-scroll-col { display: flex; flex-direction: column; gap: 9px; width: 138px; flex-shrink: 0; }

        /* ── card ───────────────────────────────── */
        .mks-card {
          background: var(--mks-surface);
          border: 1px solid var(--mks-border);
          border-radius: var(--mks-radius); overflow: hidden;
          cursor: pointer; position: relative;
          display: flex; flex-direction: column;
          box-shadow: var(--mks-sh);
          transition: box-shadow .22s, border-color .22s, transform .22s;
          animation: mks-fadein .38s ease both;
          animation-delay: calc(var(--i,0) * 50ms);
          outline: none;
        }
        .mks-card:hover, .mks-card:focus {
          border-color: var(--mks-accent);
          box-shadow: var(--mks-sh-h);
          transform: translateY(-2px);
        }
        @keyframes mks-fadein {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .mks-shine {
          position: absolute; inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 55%);
          pointer-events: none; opacity: 0; transition: opacity .3s;
        }
        .mks-card:hover .mks-shine { opacity: 1; }
        .mks-img-wrap { position: relative; aspect-ratio: 1; background: #F0EDE7; overflow: hidden; }
        .mks-img { width:100%; height:100%; object-fit:cover; transition:transform .45s cubic-bezier(.25,.46,.45,.94); }
        .mks-card:hover .mks-img { transform: scale(1.06); }
        .mks-badge {
          position: absolute; top: 6px; left: 6px;
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,.92); backdrop-filter: blur(6px);
          color: var(--mks-accent); font-size: 8.5px; font-weight: 600;
          letter-spacing: .03em; padding: 2px 6px;
          border-radius: 100px; border: 1px solid rgba(26,107,60,.2);
        }
        .mks-info { padding: 8px 11px 7px; flex:1; display:flex; flex-direction:column; gap:2px; }
        .mks-brand { font-size:8.5px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--mks-muted); margin:0; }
        .mks-name { font-family:var(--mks-font-d); font-size:12px; line-height:1.2; color:var(--mks-ink); margin:0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .mks-foot { display:flex; align-items:baseline; justify-content:space-between; margin-top:4px; }
        .mks-price { font-family:var(--mks-font-m); font-size:11px; font-weight:600; color:var(--mks-ink); }
        .mks-cond { font-size:8px; color:var(--mks-muted); text-transform:uppercase; letter-spacing:.05em; }
        .mks-arrow {
          position:absolute; bottom:8px; right:8px;
          width:20px; height:20px; display:flex; align-items:center; justify-content:center;
          background:var(--mks-bg); border-radius:50%; color:var(--mks-ink);
          opacity:0; transform:translateX(-3px); transition:opacity .2s,transform .2s;
        }
        .mks-card:hover .mks-arrow, .mks-card:focus .mks-arrow { opacity:1; transform:translateX(0); }

        /* skeleton */
        .mks-skeleton { pointer-events:none; }
        .mks-skel-block { width:100%; aspect-ratio:1; background:linear-gradient(90deg,#EDEAE3 25%,#F5F2EB 50%,#EDEAE3 75%); background-size:200% 100%; animation:mks-shimmer 1.4s infinite; }
        .mks-skel-line { height:8px; border-radius:5px; margin:5px 11px; background:linear-gradient(90deg,#EDEAE3 25%,#F5F2EB 50%,#EDEAE3 75%); background-size:200% 100%; animation:mks-shimmer 1.4s infinite; }
        .mks-skel-short { width:35%; }
        .mks-skel-long  { width:80%; margin-top:8px; }
        .mks-skel-mid   { width:50%; margin-top:11px; }
        @keyframes mks-shimmer { to { background-position:-200% 0; } }

        .mks-empty { grid-column:1/-1; font-size:12px; color:var(--mks-muted); padding:20px 0; text-align:center; }
        .mks-divider { height:1px; background:var(--mks-border); margin:0 0 20px; position:relative; }
        .mks-divider::after { content:''; position:absolute; left:0; top:0; width:50px; height:1px; background:var(--mks-accent); }
      `}</style>

      <section className="mks-section">
        {/* ── hero ── */}
        <div className="mks-hero">
          <div className="mks-hero-left">
            <div className="mks-orb-wrap" aria-hidden="true">
              <div className="mks-orb mks-orb-1" />
              <div className="mks-orb mks-orb-2" />
            </div>
            <span className="mks-hero-eyebrow">Marketplace · Nairobi</span>
            <AnimatedTitle />
            <p className="mks-hero-sub">
              Curated laptops &amp; smartphones from verified sellers across
              Kenya. Every listing hand-checked.
            </p>
            <button
              className="mks-hero-cta"
              onClick={() => navigate("/marketplace")}
            >
              Browse all listings <ArrowRight size={13} />
            </button>
          </div>

          <div className="mks-hero-right">
            <HeroCarousel />
          </div>
        </div>

        {/* ── product rows ── */}
        <div className="mks-inner">
          <CategoryRow
            label="Laptops"
            icon={Laptop}
            items={visLaptops}
            loading={loading}
            skeletonCount={4}
            onShowMore={() => setShowAllLaptops((v) => !v)}
            allShown={showAllLaptops}
          />
          <div className="mks-divider" />
          <CategoryRow
            label="Smartphones"
            icon={Smartphone}
            items={visPhones}
            loading={loading}
            skeletonCount={4}
            onShowMore={() => setShowAllPhones((v) => !v)}
            allShown={showAllPhones}
          />
        </div>
      </section>
    </>
  );
}
