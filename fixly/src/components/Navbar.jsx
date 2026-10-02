import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { getToken, getRole } from "../Hooks/loginApi";
import { useCustomer, customerLogout } from "../Hooks/customerApi";
import CustomerAuthModal from "./CustomerAuthModal";

/**
 * NAVBAR ONLY. Sticky, sitewide. Built from the "Online Store" reference.
 * Self-contained (own palette + fonts).
 *
 * Same scaling grid as Hero: reference card = 783 wide, so 1u = 1/783 of the
 * stage width. Navbar height = 60u (the reference's hanging-tab height).
 * The active tab follows the current route.
 */

const LINKS_BEFORE = [
  { label: "Home", to: "/" },
  { label: "Marketplace", to: "/marketplace" },
];
const LINKS_AFTER = [{ label: "About Us", to: "/about-us" }];

const SHOPS = [
  { to: "/shops/phones", label: "Phone Shops", sub: "Buy from trusted sellers" },
  { to: "/shops/laptops", label: "Laptop Shops", sub: "Buy from trusted sellers" },
];

const REPAIRS = [
  { to: "/request/phone", label: "Fix My Phone", sub: "Screens, battery & more" },
  { to: "/request/laptop", label: "Fix My Laptop", sub: "Hardware & software" },
  { to: "/repair-shops/phones", label: "Phone Repairs", sub: "Find phone repair shops" },
  { to: "/repair-shops/laptops", label: "Laptop Repairs", sub: "Find laptop repair shops" },
];

const ADMIN_ROLES = ["admin", "superadmin"];

function Wrench() {
  return (
    <svg className="nb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function Chevron({ open }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"
      style={{ transition: "transform .22s cubic-bezier(.22,1,.36,1)", transform: open ? "rotate(180deg)" : "none" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DropMenu({ id, label, items, active, openId, setOpenId }) {
  const open = openId === id;
  return (
    <div className="nb-rep">
      <button
        type="button"
        className={`nb-rep-btn ${active ? "is-active" : ""}`}
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label} <Chevron open={open} />
      </button>
      <div className={`nb-drop ${open ? "nb-drop--open" : "nb-drop--closed"}`}>
        {items.map(({ to, label: l, sub }) => (
          <Link key={to} to={to}>
            <span className="nb-drop-txt">{l}<small>{sub}</small></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const u = (n) => `calc(var(--u) * ${n})`;

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Montserrat:wght@500;700;800&display=swap");

.nb-root {
  --nb-bg: #f7e6d9;
  --nb-tint: #f0c09b;
  --nb-accent: #e89454;
  --nb-ink: #050505;
  position: sticky; top: 0; z-index: 50;
  background: var(--nb-bg); color: var(--nb-ink);
  font-family: 'Montserrat', sans-serif;
  transition: box-shadow .2s ease;
}
.nb-root--scrolled { box-shadow: 0 1px 0 var(--nb-tint), 0 12px 24px -18px rgba(120,70,30,.5); }
.nb-stage { container-type: inline-size; max-width: 1240px; margin: 0 auto; }
.nb-bar   { --u: calc(100cqw / 783); position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; min-height: 64px; padding: 0 20px; }

/* ───────── MOBILE (default) ───────── */
.nb-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; }
.nb-ico  { width: 28px; height: 28px; }
.nb-logo-a { font-size: 19px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; line-height: 1; }
.nb-logo-b { font-family: 'Kaushan Script', cursive; font-size: 24px; color: var(--nb-accent); transform: rotate(-6deg); margin: 14px 0 0 -4px; line-height: 1; }
.nb-ham { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--nb-tint); background: transparent; cursor: pointer; }
.nb-ham span { display: block; width: 18px; height: 1.5px; background: var(--nb-ink); border-radius: 2px; transition: all .28s cubic-bezier(.22,1,.36,1); }
.nb-ham--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.nb-ham--open span:nth-child(2) { opacity: 0; }
.nb-ham--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
.nb-menu { flex-basis: 100%; overflow: hidden; max-height: 0; transition: max-height .38s cubic-bezier(.22,1,.36,1); }
.nb-menu--open { max-height: 760px; padding-bottom: 12px; }
.nb-links { display: flex; flex-direction: column; padding-top: 8px; }
.nb-links a, .nb-drop a { display: block; padding: 14px 0; font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: inherit; text-decoration: none; border-bottom: 1px solid var(--nb-tint); }
.nb-links a.is-active { color: var(--nb-accent); }
.nb-rep-btn { display: none; }
.nb-drop-txt small { display: none; }

.nb-acct { display: flex; flex-direction: column; }
.nb-hi { padding: 14px 0 0; font-size: 11px; font-weight: 500; color: #8a6a55; }
.nb-pill { display: block; width: 100%; text-align: left; padding: 14px 0; font: 700 12px 'Montserrat', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: inherit; text-decoration: none; background: none; border: 0; border-bottom: 1px solid var(--nb-tint); cursor: pointer; }

/* ───────── DESKTOP: the reference nav, scaled ───────── */
@media (min-width: 880px) {
  .nb-bar { display: block; height: ${u(60)}; min-height: 0; padding: 0; }
  .nb-ham { display: none; }
  .nb-menu { display: contents; }

  .nb-logo { position: absolute; left: ${u(24)}; top: ${u(24)}; width: ${u(150)}; height: ${u(44)}; display: block; }
  .nb-ico { position: absolute; left: 0; top: 0; width: ${u(40)}; height: ${u(40)}; }
  .nb-logo-a { position: absolute; left: ${u(46)}; top: ${u(3)}; font-size: ${u(21)}; letter-spacing: .05em; }
  .nb-logo-b { position: absolute; left: ${u(74)}; top: ${u(21)}; margin: 0; font-size: ${u(25)}; }

  .nb-links { position: absolute; left: ${u(215)}; top: 0; height: ${u(60)}; flex-direction: row; gap: ${u(6)}; padding: 0; }
  .nb-links a, .nb-rep-btn {
    display: flex; align-items: center; gap: 6px; box-sizing: border-box; height: 100%;
    padding: ${u(14)} ${u(13)} 0; border: 0; border-bottom: 0; background: none; cursor: pointer;
    font: 700 max(9px, ${u(7.6)}) 'Montserrat', sans-serif; letter-spacing: .2em; text-transform: uppercase;
    color: inherit; text-decoration: none; white-space: nowrap; transition: color .18s;
  }
  .nb-links a.is-active, .nb-rep-btn.is-active { background: var(--nb-tint); color: inherit; }
  .nb-links a:not(.is-active):hover, .nb-rep-btn:not(.is-active):hover { color: var(--nb-accent); }
  .nb-rep { position: relative; height: 100%; }

  .nb-drop { position: absolute; top: 100%; left: 0; min-width: 220px; background: #fffaf6; border: 1px solid var(--nb-tint); border-radius: 10px; overflow: hidden; box-shadow: 0 14px 30px -12px rgba(120,70,30,.35); transition: opacity .2s, transform .22s cubic-bezier(.22,1,.36,1); }
  .nb-drop--closed { opacity: 0; transform: translateY(-6px); pointer-events: none; }
  .nb-drop--open   { opacity: 1; transform: none; }
  .nb-drop a { padding: 13px 16px; font-size: 11px; letter-spacing: .12em; }
  .nb-drop a:last-child { border-bottom: 0; }
  .nb-drop a:hover { background: color-mix(in srgb, var(--nb-tint) 40%, transparent); }
  .nb-drop-txt { display: flex; flex-direction: column; gap: 3px; }
  .nb-drop-txt small { display: block; font-size: 10px; font-weight: 500; letter-spacing: .02em; text-transform: none; color: #8a6a55; }

  .nb-acct { position: absolute; right: ${u(24)}; top: 0; height: ${u(60)}; flex-direction: row; align-items: center; }
  .nb-hi { display: none; }
  .nb-pill { width: auto; text-align: center; padding: ${u(7)} ${u(12)}; font-size: max(9px, ${u(7.6)}); letter-spacing: .2em; border: 1.5px solid var(--nb-ink); border-radius: 999px; white-space: nowrap; transition: background .18s, color .18s; }
  .nb-pill:hover { background: var(--nb-ink); color: var(--nb-bg); }
}

@media (prefers-reduced-motion: reduce) {
  .nb-root, .nb-menu, .nb-ham span, .nb-drop { transition: none; }
}
`;

export default function Navbar() {
  const { pathname } = useLocation();
  const customer = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const linksRef = useRef(null);

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const shopsActive = pathname.startsWith("/shops");
  const repairsActive = pathname.startsWith("/request") || pathname.startsWith("/repair-shops");

  // Staff (admin / shop owner) already signed in through /login
  const role = getToken() ? getRole() : null;
  const dashboard = ADMIN_ROLES.includes(role) ? "/admin" : role === "shop_owner" ? "/shop" : null;

  useEffect(() => {
    const close = (e) => {
      if (linksRef.current && !linksRef.current.contains(e.target)) setOpenId(null);
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => { setMenuOpen(false); setOpenId(null); }, [pathname]);

  return (
    <>
      <nav className={`nb-root ${scrolled ? "nb-root--scrolled" : ""}`} aria-label="Main">
        <style>{CSS}</style>
        <div className="nb-stage">
          <div className="nb-bar">
            <Link to="/" className="nb-logo" aria-label="Fixly World home">
         
              <span className="nb-logo-a">Fixly</span>
              <span className="nb-logo-b">World</span>
            </Link>

            <button
              className={`nb-ham ${menuOpen ? "nb-ham--open" : ""}`}
              onClick={() => { setMenuOpen((o) => !o); setOpenId(null); }}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>

            <div className={`nb-menu ${menuOpen ? "nb-menu--open" : ""}`}>
              <div className="nb-links" ref={linksRef}>
                {LINKS_BEFORE.map(({ label, to }) => (
                  <Link key={to} to={to} className={isActive(to) ? "is-active" : ""}>{label}</Link>
                ))}

                <DropMenu id="shops" label="Shops" items={SHOPS} active={shopsActive} openId={openId} setOpenId={setOpenId} />
                <DropMenu id="repairs" label="Repairs" items={REPAIRS} active={repairsActive} openId={openId} setOpenId={setOpenId} />

                {LINKS_AFTER.map(({ label, to }) => (
                  <Link key={to} to={to} className={isActive(to) ? "is-active" : ""}>{label}</Link>
                ))}
              </div>

              <div className="nb-acct">
                {dashboard ? (
                  <Link className="nb-pill" to={dashboard}>Dashboard</Link>
                ) : customer ? (
                  <>
                    <span className="nb-hi">Hi, {customer.name.split(" ")[0]}</span>
                    <button className="nb-pill" onClick={customerLogout} title={customer.email}>Log out</button>
                  </>
                ) : (
                  <button className="nb-pill" onClick={() => { setAuthOpen(true); setMenuOpen(false); }}>Log in</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <CustomerAuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
    </>
  );
}