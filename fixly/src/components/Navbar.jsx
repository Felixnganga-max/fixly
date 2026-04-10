import { useState, useEffect, useRef } from "react";

const navLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "About Us", href: "/about-us" },
];

const devices = [
  {
    href: "/request/phone",
    label: "Fix My Phone",
    sub: "Screens, battery & more",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#005f02"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <circle cx="12" cy="18" r="1" fill="#005f02" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/request/laptop",
    label: "Fix My Laptop",
    sub: "Hardware & software",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#005f02"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M0 21h24" />
      </svg>
    ),
  },
];

function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{
        transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Logo() {
  return (
    <a
      href="/"
      style={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display, 'Syne', sans-serif)",
          fontSize: "1.55rem",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        <span style={{ color: "var(--color-black, #0d1117)" }}>Fix</span>
        <span style={{ color: "var(--color-green, #005f02)" }}>ly</span>
      </span>
    </a>
  );
}

export default function Navbar() {
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDeviceOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        /* ── Nav shell ── */
        .nb-root {
          position: sticky; top: 0; z-index: 50;
          width: 100%;
          background: var(--color-beige, #f5f0e8);
          border-bottom: 1px solid var(--color-beige-dark, #e8e0d0);
          font-family: var(--font-body, 'DM Sans', sans-serif);
        }
        .nb-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          height: 66px;
        }

        /* ── Desktop links ── */
        .nb-links { display: flex; align-items: center; gap: 2px; list-style: none; }
        @media(max-width:640px){ .nb-links, .nb-right { display: none !important; } .nb-ham { display: flex !important; } }

        .nb-links a {
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 13.5px; font-weight: 500;
          color: var(--color-beige-text, #6b6155);
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 100px;
          transition: color 0.18s, background 0.18s;
        }
        .nb-links a:hover {
          color: var(--color-black, #0d1117);
          background: var(--color-beige-dark, #e8e0d0);
        }

        /* ── Right cluster ── */
        .nb-right { display: flex; align-items: center; gap: 8px; }

        .nb-admin {
          display: flex; align-items: center; gap: 5px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 13px; font-weight: 500;
          color: var(--color-beige-text, #6b6155);
          text-decoration: none;
          padding: 7px 12px; border-radius: 100px;
          border: 1px solid transparent;
          transition: all 0.18s;
        }
        .nb-admin:hover {
          color: var(--color-black, #0d1117);
          background: var(--color-beige-dark, #e8e0d0);
          border-color: var(--color-beige-dark, #e8e0d0);
        }

        /* ── CTA pill ── */
        .nb-cta-wrap { position: relative; }
        .nb-cta {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 13.5px; font-weight: 600;
          background: var(--color-black, #0d1117);
          color: var(--color-beige, #f5f0e8);
          padding: 9px 18px; border-radius: 100px;
          border: 1.5px solid var(--color-black, #0d1117);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
        }
        .nb-cta:hover {
          background: transparent;
          color: var(--color-black, #0d1117);
        }

        /* ── Dropdown ── */
        .nb-drop {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 230px;
          background: var(--color-black, #0d1117);
          border: 1px solid var(--color-black-border, #30363d);
          border-radius: var(--radius-lg, 14px);
          overflow: hidden;
          box-shadow: 0 16px 40px -8px rgba(0,0,0,0.45);
          transition: opacity 0.2s, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nb-drop--closed { opacity: 0; transform: translateY(-8px) scale(0.97); pointer-events: none; }
        .nb-drop--open   { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

        .nb-drop a {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 13.5px; font-weight: 500;
          color: #c9d1d9;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .nb-drop a:hover { background: var(--color-black-card, #161b22); color: white; }
        .nb-drop a + a { border-top: 1px solid var(--color-black-border, #30363d); }

        .nb-drop-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(0, 95, 2, 0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .nb-drop-txt { display: flex; flex-direction: column; gap: 1px; }
        .nb-drop-txt span:first-child { font-size: 13.5px; font-weight: 600; }
        .nb-drop-txt span:last-child { font-size: 11px; color: var(--color-white-muted, #8b949e); }

        /* ── Hamburger ── */
        .nb-ham {
          display: none;
          flex-direction: column; align-items: center; justify-content: center; gap: 5px;
          width: 38px; height: 38px;
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--color-beige-dark, #e8e0d0);
          background: transparent; cursor: pointer;
          transition: background 0.18s;
        }
        .nb-ham:hover { background: var(--color-beige-dark, #e8e0d0); }
        .nb-ham span {
          display: block; width: 18px; height: 1.5px;
          background: var(--color-black, #0d1117);
          border-radius: 2px;
          transform-origin: center;
          transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nb-ham--open span:nth-child(1) { transform: rotate(45deg) translate(4.5px, 4.5px); }
        .nb-ham--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-ham--open span:nth-child(3) { transform: rotate(-45deg) translate(4.5px, -4.5px); }

        /* ── Mobile menu ── */
        .nb-mob {
          overflow: hidden;
          max-height: 0;
          background: var(--color-beige, #f5f0e8);
          border-top: 1px solid transparent;
          transition: max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s;
        }
        .nb-mob--open {
          max-height: 520px;
          border-top-color: var(--color-beige-dark, #e8e0d0);
        }

        .nb-mob-links { list-style: none; padding: 12px 24px 4px; }
        .nb-mob-links li a {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 0;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 14px; font-weight: 500;
          color: var(--color-beige-text, #6b6155);
          text-decoration: none;
          border-bottom: 1px solid var(--color-beige-dark, #e8e0d0);
          transition: color 0.18s;
        }
        .nb-mob-links li:last-child a { border-bottom: none; }
        .nb-mob-links li a:hover { color: var(--color-black, #0d1117); }

        .nb-mob-ctas {
          display: flex; flex-direction: column; gap: 10px;
          padding: 16px 24px 28px;
          border-top: 1px solid var(--color-beige-dark, #e8e0d0);
        }
        .nb-mob-cta-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 14px; font-weight: 600;
          background: var(--color-black, #0d1117);
          color: var(--color-beige, #f5f0e8);
          padding: 14px; border-radius: var(--radius-md, 10px);
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .nb-mob-cta-primary:hover { opacity: 0.85; }
        .nb-mob-cta-secondary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 14px; font-weight: 600;
          background: white;
          color: var(--color-black, #0d1117);
          padding: 14px; border-radius: var(--radius-md, 10px);
          text-decoration: none;
          border: 1.5px solid var(--color-beige-dark, #e8e0d0);
          transition: background 0.18s;
        }
        .nb-mob-cta-secondary:hover { background: var(--color-beige-dark, #e8e0d0); }
      `}</style>

      <nav className="nb-root">
        <div className="nb-inner">
          <Logo />

          {/* Desktop nav links */}
          <ul className="nb-links">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>

          {/* Desktop right */}
          <div className="nb-right">
            <a href="/login" className="nb-admin">
              <LockIcon />
              Admin
            </a>

            <div className="nb-cta-wrap" ref={dropRef}>
              <button
                className="nb-cta"
                onClick={() => setDeviceOpen((o) => !o)}
                aria-expanded={deviceOpen}
              >
                Get a Repair
                <ChevronIcon open={deviceOpen} />
              </button>

              <div
                className={`nb-drop ${deviceOpen ? "nb-drop--open" : "nb-drop--closed"}`}
              >
                {devices.map(({ href, label, sub, icon }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setDeviceOpen(false)}
                  >
                    <div className="nb-drop-icon">{icon}</div>
                    <div className="nb-drop-txt">
                      <span>{label}</span>
                      <span>{sub}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Hamburger */}
          <button
            className={`nb-ham ${menuOpen ? "nb-ham--open" : ""}`}
            onClick={() => {
              setMenuOpen((o) => !o);
              setDeviceOpen(false);
            }}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`nb-mob ${menuOpen ? "nb-mob--open" : ""}`}>
          <ul className="nb-mob-links">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href="/login" onClick={() => setMenuOpen(false)}>
                <LockIcon />
                Admin Login
              </a>
            </li>
          </ul>

          <div className="nb-mob-ctas">
            <a
              href="/request/phone"
              className="nb-mob-cta-primary"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <circle
                  cx="12"
                  cy="18"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              Fix My Phone
            </a>
            <a
              href="/request/laptop"
              className="nb-mob-cta-secondary"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M0 21h24" />
              </svg>
              Fix My Laptop
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
