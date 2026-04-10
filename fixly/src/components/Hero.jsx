import { useState, useEffect, useRef } from "react";

// ─── Mock assets (replace with your actual import) ───────────────────────────
const assets = {
  phone:
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
  laptop:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const devices = [
  {
    id: "phone",
    label: "Fix My Phone",
    image: assets.phone,
    alt: "Smartphone repair",
    issues: ["Cracked screen", "Battery", "Water damage", "Other"],
    from: "From KSh 2,500",
    warranty: "90-day warranty",
    stat: "Screen repairs in 2 hrs",
  },
  {
    id: "laptop",
    label: "Fix My Laptop",
    image: assets.laptop,
    alt: "Laptop repair",
    issues: ["Won't turn on", "Slow / virus", "Screen broken", "Other"],
    from: "From KSh 4,000",
    warranty: "90-day warranty",
    stat: "Same-day diagnostics",
  },
];

const headlines = [
  "Screen cracked?",
  "Battery dying?",
  "Laptop dead?",
  "Broken device?",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarStack() {
  const initials = ["WK", "AM", "JN", "FM", "SK"];
  const colors = ["#005f02", "#3b6d11", "#0a5c36", "#1a7a2a", "#2d8a50"];
  return (
    <div className="avatar-stack">
      {initials.map((init, i) => (
        <div
          key={i}
          className="avatar"
          style={{
            background: colors[i],
            zIndex: 5 - i,
            marginLeft: i === 0 ? 0 : -10,
          }}
        >
          {init}
        </div>
      ))}
      <span className="avatar-label">
        Trusted by <strong>12,400+</strong> customers
      </span>
    </div>
  );
}

function DeviceCard({
  id,
  label,
  image,
  alt,
  issues,
  from,
  warranty,
  stat,
  index,
}) {
  const [hovered, setHovered] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100 + index * 180);
    return () => clearTimeout(timer);
  }, [index]);

  // 3D tilt
  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = ((e.clientX - cx) / (rect.width / 2)) * 6;
    const dy = ((e.clientY - cy) / (rect.height / 2)) * -6;
    setTilt({ x: dy, y: dx });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const waLink = `https://wa.me/254700000000?text=Hi%2C%20I%20need%20to%20fix%20my%20${id}${selectedIssue ? `%20-%20${encodeURIComponent(selectedIssue)}` : ""}`;

  return (
    <div
      ref={cardRef}
      className={`device-card ${visible ? "device-card--visible" : ""} ${hovered ? "device-card--hovered" : ""}`}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? "translateY(-10px)" : "translateY(0)"}`,
        transitionDelay: visible ? "0ms" : `${index * 180}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Warranty badge */}
      <div className="warranty-badge">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1L7.5 4.5H11L8.5 6.8L9.5 10.5L6 8.5L2.5 10.5L3.5 6.8L1 4.5H4.5Z"
            fill="#005f02"
          />
        </svg>
        {warranty}
      </div>

      {/* Image with parallax feel */}
      <div className="card-image-wrap">
        <img
          src={image}
          alt={alt}
          className={`card-image ${hovered ? "card-image--hovered" : ""}`}
        />
        {/* Before/after shimmer overlay */}
        <div
          className={`image-overlay ${hovered ? "image-overlay--hovered" : ""}`}
        />

        {/* Stat chip on image */}
        <div className="image-stat">
          <span className="stat-dot" />
          {stat}
        </div>
      </div>

      {/* Issue chips — appear on hover */}
      <div className={`chips-row ${hovered ? "chips-row--visible" : ""}`}>
        {issues.map((issue) => (
          <button
            key={issue}
            className={`chip ${selectedIssue === issue ? "chip--selected" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setSelectedIssue(selectedIssue === issue ? null : issue);
            }}
          >
            {issue}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div>
          <div className="card-label">{label}</div>
          <div className="card-from">{from}</div>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`cta-btn ${hovered ? "cta-btn--active" : ""}`}
        >
          <span className="cta-text">
            {selectedIssue ? `Fix ${selectedIssue}` : "Start"}
          </span>
          <span className="cta-arrow">→</span>
        </a>
      </div>
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export default function Hero() {
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [fade, setFade] = useState(true);

  // Rotating headline
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setHeadlineIdx((i) => (i + 1) % headlines.length);
        setFade(true);
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        /* ── Fonts ──────────────────────────────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

        /* ── Hero shell ─────────────────────────────────────────────────── */
        .hero-section {
          background: var(--color-beige, #f5f0e8);
          padding: 52px 20px 56px;
          overflow: hidden;
          position: relative;
          font-family: var(--font-body, 'DM Sans', sans-serif);
        }
        .hero-inner { max-width: 1100px; margin: 0 auto; }

        /* subtle grain texture */
        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.5;
        }

        /* ── Top bar ────────────────────────────────────────────────────── */
        .hero-topbar {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 36px;
        }
        .avatar-stack {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid var(--color-beige, #f5f0e8);
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
        }
        .avatar-label {
          font-size: 13px;
          color: var(--color-beige-text, #6b6155);
          margin-left: 14px;
          font-family: var(--font-body);
          white-space: nowrap;
        }

        /* ── Headline ───────────────────────────────────────────────────── */
        .hero-headline {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(2.4rem, 5.5vw, 4rem);
          font-weight: 800;
          color: var(--color-black, #0d1117);
          line-height: 1.05;
          letter-spacing: -0.03em;
          text-align: center;
          margin-bottom: 6px;
        }
        .headline-rotating {
          display: inline-block;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .headline-rotating--in {
          opacity: 1; transform: translateY(0);
        }
        .headline-rotating--out {
          opacity: 0; transform: translateY(-10px);
        }
        .hero-subline {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(1.15rem, 2.8vw, 1.7rem);
          font-weight: 700;
          font-style: italic;
          color: var(--color-green, #005f02);
          text-align: center;
          position: relative;
          display: inline-block;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 44px;
        }
        .underline-svg {
          position: absolute;
          bottom: -6px;
          left: 0; width: 100%;
          height: 10px;
        }

        /* ── Cards grid ─────────────────────────────────────────────────── */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 600px) {
          .cards-grid { grid-template-columns: 1fr; }
        }

        /* ── Device card ────────────────────────────────────────────────── */
        .device-card {
          position: relative;
          background: white;
          border: 1.5px solid var(--color-beige-dark, #e8e0d0);
          border-radius: var(--radius-lg, 14px);
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          transform-style: preserve-3d;
          will-change: transform;
          /* entrance */
          opacity: 0;
          translate: 0 32px;
        }
        .device-card--visible {
          animation: cardIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes cardIn {
          to { opacity: 1; translate: 0 0; }
        }
        .device-card--hovered {
          border-color: var(--color-green, #005f02);
          box-shadow: 0 16px 48px -12px rgba(0,95,2,0.18), 0 2px 8px -2px rgba(0,95,2,0.08);
        }

        /* Warranty badge */
        .warranty-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 10;
          background: white;
          border: 1px solid var(--color-beige-dark, #e8e0d0);
          border-radius: 100px;
          padding: 5px 11px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-green, #005f02);
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-body);
          letter-spacing: 0.01em;
        }

        /* Image */
        .card-image-wrap {
          position: relative;
          width: 100%;
          height: 260px;
          overflow: hidden;
          background: var(--color-beige-dark, #e8e0d0);
        }
        @media (max-width: 600px) {
          .card-image-wrap { height: 200px; }
        }
        .card-image {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          transform: scale(1.0);
        }
        .card-image--hovered { transform: scale(1.04); }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(0,95,2,0.0) 100%);
          transition: background 0.4s;
        }
        .image-overlay--hovered {
          background: linear-gradient(to bottom, transparent 30%, rgba(0,95,2,0.08) 100%);
        }

        /* Stat chip on image */
        .image-stat {
          position: absolute;
          bottom: 12px;
          left: 14px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          border: 1px solid var(--color-beige-dark, #e8e0d0);
          border-radius: 100px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-black, #0d1117);
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-body);
        }
        .stat-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-green, #005f02);
          flex-shrink: 0;
        }

        /* Issue chips */
        .chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 12px 16px 0;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease, padding 0.3s ease;
          padding-top: 0;
        }
        .chips-row--visible {
          max-height: 80px;
          opacity: 1;
          padding: 12px 16px 0;
        }
        .chip {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 100px;
          border: 1px solid var(--color-beige-dark, #e8e0d0);
          background: var(--color-beige, #f5f0e8);
          color: var(--color-beige-text, #6b6155);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .chip:hover {
          border-color: var(--color-green, #005f02);
          color: var(--color-green, #005f02);
          background: var(--color-green-light, #e6faf5);
        }
        .chip--selected {
          background: var(--color-green, #005f02);
          color: white;
          border-color: var(--color-green, #005f02);
        }

        /* Footer */
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px 18px;
          gap: 12px;
        }
        .card-label {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-weight: 800;
          font-size: 1.2rem;
          color: var(--color-black, #0d1117);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .card-from {
          font-size: 12px;
          color: var(--color-beige-text, #6b6155);
          margin-top: 3px;
          font-family: var(--font-body);
        }
        .cta-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          padding: 11px 20px;
          border-radius: var(--radius-md, 10px);
          background: var(--color-beige, #f5f0e8);
          color: var(--color-beige-text, #6b6155);
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          border: 1.5px solid transparent;
          flex-shrink: 0;
        }
        .cta-btn--active {
          background: var(--color-green, #005f02);
          color: white;
          border-color: var(--color-green, #005f02);
          box-shadow: 0 4px 16px -4px rgba(0,95,2,0.35);
        }
        .cta-arrow {
          display: inline-block;
          transition: transform 0.25s ease;
        }
        .cta-btn--active .cta-arrow { transform: translateX(3px); }
        .cta-text { transition: all 0.2s ease; }

        /* ── Trust note ─────────────────────────────────────────────────── */
        .trust-note {
          text-align: center;
          font-size: 12px;
          color: var(--color-beige-text, #6b6155);
          margin-top: 28px;
          letter-spacing: 0.04em;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .trust-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--color-beige-dark, #e8e0d0); }
      `}</style>

      <section className="hero-section">
        <div className="hero-inner">
          {/* Top bar */}
          <div className="hero-topbar">
            <AvatarStack />
          </div>

          {/* Rotating headline */}
          <h1 className="hero-headline">
            <span
              className={`headline-rotating ${fade ? "headline-rotating--in" : "headline-rotating--out"}`}
            >
              {headlines[headlineIdx]}
            </span>
            <br />
          </h1>

          {/* Subline */}
          <div className="hero-subline">
            Get it fixed by verified technicians in minutes!
            <svg
              className="underline-svg"
              viewBox="0 0 300 10"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 7 C60 2, 150 2, 298 7"
                stroke="var(--color-green)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Cards */}
          <div className="cards-grid">
            {devices.map((device, i) => (
              <DeviceCard key={device.id} {...device} index={i} />
            ))}
          </div>

          {/* Trust note */}
          <p className="trust-note">
            No account needed
            <span className="trust-dot" />
            We reach you via WhatsApp
            <span className="trust-dot" />
            Verified technicians only
          </p>
        </div>
      </section>
    </>
  );
}
