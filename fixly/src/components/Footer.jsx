const links = {
  Platform: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Technicians", href: "#technicians" },
    { label: "Pricing", href: "#pricing" },
  ],
  Repairs: [
    { label: "Fix My Phone", href: "/request/phone" },
    { label: "Fix My Laptop", href: "/request/laptop" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

const WaIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.126 1.526 5.872L.054 23.454a.5.5 0 00.492.596.498.498 0 00.143-.021l5.735-1.635A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.371l-.36-.214-3.733 1.065 1.2-3.572-.235-.369A9.9 9.9 0 012.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z" />
  </svg>
);

const KenyaFlag = () => (
  <span style={{ display: "inline-flex", gap: "1.5px", alignItems: "center" }}>
    {["#006600", "#cc0000", "#000000"].map((c) => (
      <span
        key={c}
        style={{
          display: "inline-block",
          width: 5,
          height: 12,
          borderRadius: 1,
          background: c,
        }}
      />
    ))}
  </span>
);

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-root {
          background: var(--color-black, #0d1117);
          padding: 64px 24px 0;
          position: relative;
          overflow: hidden;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          width: 100%;
        }

        /* diagonal green-tinted stripe texture */
        .footer-root::before {
          content: '';
          position: absolute;
          top: -60px; right: -80px;
          width: 420px; height: 420px;
          background: repeating-linear-gradient(
            -55deg,
            transparent,
            transparent 18px,
            rgba(0,95,2,0.07) 18px,
            rgba(0,95,2,0.07) 19px
          );
          border-radius: 50%;
          pointer-events: none;
        }

        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
        }

        /* ── Brand block ── */
        .footer-brand {
          border-bottom: 1px solid var(--color-black-border, #30363d);
          padding-bottom: 40px;
          margin-bottom: 40px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 24px;
        }
        @media (max-width: 580px) {
          .footer-brand { grid-template-columns: 1fr; align-items: flex-start; gap: 20px; }
        }

        .footer-wordmark {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(3.2rem, 8vw, 6rem);
          font-weight: 800;
          color: var(--color-beige, #f5f0e8);
          letter-spacing: -0.04em;
          line-height: 0.95;
          display: block;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .footer-wordmark:hover { opacity: 0.85; }
        .footer-wordmark span { color: var(--color-green, #005f02); }

        .footer-brand-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 14px;
        }
        @media (max-width: 580px) {
          .footer-brand-right { align-items: flex-start; }
          .footer-tagline { text-align: left !important; max-width: none !important; }
        }

        .footer-tagline {
          font-size: 13px;
          color: var(--color-white-muted, #8b949e);
          line-height: 1.6;
          max-width: 200px;
          text-align: right;
          font-family: var(--font-body, 'DM Sans', sans-serif);
        }

        .footer-wa {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-green, #005f02);
          color: white;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 13px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 100px;
          text-decoration: none;
          border: 1.5px solid var(--color-green, #005f02);
          transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
          white-space: nowrap;
        }
        .footer-wa:hover {
          background: transparent;
          color: var(--color-green, #005f02);
        }

        /* ── Links ── */
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 48px;
        }
        @media (max-width: 480px) {
          .footer-links { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }

        .footer-group h4 {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-white-muted, #8b949e);
          margin-bottom: 16px;
        }

        .footer-group ul { list-style: none; display: flex; flex-direction: column; gap: 11px; }

        .footer-group a {
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 14px;
          color: #c9d1d9;
          text-decoration: none;
          display: inline-block;
          position: relative;
          padding-bottom: 1px;
          transition: color 0.2s ease;
        }
        .footer-group a::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1.5px;
          background: var(--color-green, #005f02);
          transition: width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .footer-group a:hover { color: white; }
        .footer-group a:hover::after { width: 100%; }

        /* ── Bottom bar ── */
        .footer-bottom {
          border-top: 1px solid var(--color-black-border, #30363d);
          padding: 20px 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .footer-bottom p {
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 12px;
          color: var(--color-white-muted, #8b949e);
        }

        .footer-flag-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 12px;
          color: var(--color-white-muted, #8b949e);
          background: var(--color-black-card, #161b22);
          border: 1px solid var(--color-black-border, #30363d);
          padding: 5px 12px;
          border-radius: 100px;
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-inner">
          {/* Brand block */}
          <div className="footer-brand">
            <a href="/" className="footer-wordmark">
              Fix<span>ly</span>
            </a>
            <div className="footer-brand-right">
              <p className="footer-tagline">
                Nairobi's verified repair network. Phones and laptops, done
                right.
              </p>
              <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noreferrer"
                className="footer-wa"
              >
                <WaIcon />
                WhatsApp us
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links">
            {Object.entries(links).map(([group, items]) => (
              <div key={group} className="footer-group">
                <h4>{group}</h4>
                <ul>
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href}>{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Fixly. All rights reserved.</p>
            <div className="footer-flag-badge">
              <KenyaFlag />
              Built for Nairobi
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
