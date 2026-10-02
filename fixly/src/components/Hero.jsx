import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {assets} from "../assets/assets";
/**
 * HERO ONLY (no navbar). Built from the "Online Store" reference.
 * Self-contained (own palette + fonts). Put <Navbar /> above it.
 *
 * Reference card = 783 x 440. This hero is everything BELOW the 60u navbar
 * band, i.e. 783 x 380, so Navbar + Hero stacked equal the reference exactly.
 * 1u = 1/783 of the stage width (same grid as Navbar).
 */

// Carousel images from ../assets/assets (hero, hero2, hero3). Transparent PNG
// cutouts work best: they break out of the circle top and bottom.
// Missing ones are skipped; with none, the built-in placeholder phone shows.
const SLIDES = [assets.hero, assets.hero2, assets.hero3].filter(Boolean);
const SLIDE_MS = 4500;

// Fallback centre image when there are no slides: null = placeholder phone.
const HERO_IMG = null;

const Ic = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// TODO: replace the "#" links with your real profile URLs
const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <Ic>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r=".6" fill="currentColor" />
      </Ic>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <Ic>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </Ic>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <Ic>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </Ic>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <Ic>
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </Ic>
    ),
  },
];

// Stand-in for the model cutout: a phone that breaks out of the circle.
function PlaceholderDevice() {
  return (
    <svg viewBox="0 0 128 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="hh-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3a66a" />
          <stop offset="1" stopColor="#d9793a" />
        </linearGradient>
      </defs>
      <rect width="128" height="300" rx="22" fill="#050505" />
      <rect x="5" y="5" width="118" height="290" rx="17" fill="url(#hh-screen)" />
      <rect x="45" y="13" width="38" height="10" rx="5" fill="#050505" />
      <rect x="16" y="62" width="96" height="8" rx="4" fill="#fff" opacity=".92" />
      <rect x="16" y="77" width="64" height="8" rx="4" fill="#fff" opacity=".55" />
      <rect x="16" y="120" width="96" height="76" rx="12" fill="#fff" opacity=".22" />
      <rect x="16" y="208" width="45" height="48" rx="12" fill="#fff" opacity=".22" />
      <rect x="67" y="208" width="45" height="48" rx="12" fill="#fff" opacity=".22" />
    </svg>
  );
}

// u(n) = n reference-pixels, scaled to the card width
const u = (n) => `calc(var(--u) * ${n})`;

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Montserrat:wght@300;500;700;800;900&display=swap");

.hh-root {
  /* palette sampled from the reference */
  --hh-bg: #f7e6d9;
  --hh-tint: #f0c09b;
  --hh-accent: #e89454;
  --hh-ink: #050505;
  background: var(--hh-bg);
  color: var(--hh-ink);
  font-family: 'Montserrat', sans-serif;
  overflow: hidden;
}
.hh-stage { container-type: inline-size; max-width: 1240px; margin: 0 auto; }
.hh-card  { --u: calc(100cqw / 783); position: relative; padding: 8px 20px 36px; }
.hh-clip  { position: absolute; inset: 0; pointer-events: none; }
.hh-blob  { position: absolute; right: -70px; top: 16px; width: 170px; aspect-ratio: 1; border-radius: 50%; background: var(--hh-tint); }

.cap { display: block; }
.cap > span { display: block; font-size: var(--fm); line-height: 1.02; transition: transform .25s cubic-bezier(.22,1,.36,1); }

/* ───────── MOBILE (default) ───────── */
.hh-h1 { margin: 24px 0 0; position: relative; z-index: 3; }
.hh-thin { --fm: clamp(1.05rem, 5.2vw, 1.5rem); font-weight: 300; letter-spacing: .14em; text-transform: uppercase; }
.hh-love, .hh-of { --fm: clamp(3.1rem, 17vw, 4.6rem); font-weight: 900; letter-spacing: -.01em; text-transform: uppercase; }
.hh-love { margin-top: 6px; }
.hh-of   { margin-top: 2px; }
.hh-script {
  display: block; width: max-content;
  font-family: 'Kaushan Script', cursive; font-weight: 400;
  font-size: clamp(2.6rem, 14vw, 3.8rem); line-height: 1;
  color: var(--hh-accent);
  margin: -.5em 0 0 .9em;
  --rot: -8deg; transform: rotate(var(--rot)); transform-origin: left bottom;
  position: relative; z-index: 2;
  -webkit-text-stroke: 5px var(--hh-bg); paint-order: stroke fill;
  animation: hh-in .7s .25s cubic-bezier(.22,1,.36,1) both;
}
@keyframes hh-in {
  from { opacity: 0; transform: translateY(10px) rotate(var(--rot)); }
  to   { opacity: 1; transform: translateY(0) rotate(var(--rot)); }
}

.hh-visual { position: relative; width: min(74vw, 290px); aspect-ratio: 1; margin: 56px auto 68px; }
.hh-disc   { position: absolute; inset: 0; border-radius: 50%; background: #fff; }
.hh-ground { position: absolute; left: 15%; bottom: -14%; width: 70%; height: 9%; background: radial-gradient(ellipse at center, rgba(5,5,5,.32), transparent 70%); filter: blur(3px); z-index: 1; }
.hh-device { position: absolute; left: 50%; top: -12%; height: 117%; aspect-ratio: 128 / 300; transform: translateX(-50%); z-index: 2; }
.hh-device svg, .hh-device img { display: block; width: 100%; height: 100%; object-fit: contain; }

/* carousel */
.hh-slides { position: absolute; left: 0; top: -12%; width: 100%; height: 117%; z-index: 2; touch-action: pan-y; }
.hh-slide  { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0; transform: scale(.96); transition: opacity .7s ease, transform .7s cubic-bezier(.22,1,.36,1); user-select: none; -webkit-user-drag: none; }
.hh-slide--on { opacity: 1; transform: none; }
.hh-dots { position: absolute; left: 50%; bottom: -50px; transform: translateX(-50%); display: flex; gap: 8px; z-index: 3; }
.hh-dot  { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 99px; background: var(--hh-tint); cursor: pointer; transition: width .3s cubic-bezier(.22,1,.36,1), background .3s; }
.hh-dot--on { width: 22px; background: var(--hh-accent); }
.hh-dot:focus-visible { outline: 2px solid var(--hh-ink); outline-offset: 3px; }

.hh-offer { position: relative; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; width: min(100%, 260px); text-decoration: none; color: inherit; }
.hh-offer:focus-visible { outline: 2px solid var(--hh-accent); outline-offset: 10px; border-radius: 8px; }
.hh-o-phones   { --fm: 2rem;   font-weight: 800; letter-spacing: .02em; text-transform: uppercase; }
.hh-o-and      { --fm: .8rem;  font-weight: 500; letter-spacing: .2em;  text-transform: uppercase; margin-top: 8px; }
.hh-o-laptops  { --fm: 1.5rem; font-weight: 800; letter-spacing: .02em; text-transform: uppercase; margin-top: 8px; }
.hh-rule       { display: block; align-self: stretch; height: 2px; background: var(--hh-ink); margin-top: 14px; }
.hh-o-amazing  { --fm: 1.6rem; font-weight: 800; letter-spacing: .02em; text-transform: uppercase; color: var(--hh-accent); margin-top: 14px; }
.hh-o-deals    { --fm: 2.5rem; font-weight: 800; letter-spacing: .02em; text-transform: uppercase; color: var(--hh-accent); margin-top: 6px; }
.hh-o-deals + .hh-rule { margin-top: 14px; }

.hh-social { display: flex; gap: 10px; list-style: none; margin: 32px 0 0; padding: 0; }
.hh-social a { width: 36px; height: 36px; border-radius: 50%; background: var(--hh-accent); color: #fff; display: flex; align-items: center; justify-content: center; transition: transform .2s ease; }
.hh-social a:hover { transform: translateY(-3px); }
.hh-social a:focus-visible { outline: 2px solid var(--hh-ink); outline-offset: 3px; }
.hh-social svg { width: 16px; height: 16px; }

/* ───────── DESKTOP: the reference grid, scaled ───────── */
@media (min-width: 880px) {
  .hh-card { aspect-ratio: 783 / 380; padding: 0; }
  .hh-blob { right: auto; left: ${u(688)}; top: ${u(16)}; width: ${u(136)}; }

  .cap { position: relative; height: calc(var(--fd) * .7); }
  .cap > span { position: absolute; left: 0; bottom: calc(var(--fd) * -.1415); font-size: var(--fd); line-height: 1; white-space: nowrap; }

  .hh-h1 { position: absolute; left: ${u(45)}; top: ${u(70.5)}; margin: 0; }
  .hh-thin { --fd: ${u(25)}; letter-spacing: .12em; }
  .hh-love { --fd: ${u(72)}; margin-top: ${u(13)}; }
  .hh-of   { --fd: ${u(72)}; margin-top: ${u(16)}; }
  .hh-script { position: absolute; display: block; left: ${u(41)}; top: ${u(131)}; margin: 0; font-size: ${u(58)}; --rot: -9deg; -webkit-text-stroke: ${u(6)} var(--hh-bg); }

  .hh-visual { display: contents; }
  .hh-disc   { inset: auto; left: ${u(263)}; top: ${u(33)}; width: ${u(257)}; height: ${u(257)}; }
  .hh-ground { left: ${u(296)}; top: ${u(302)}; bottom: auto; width: ${u(190)}; height: ${u(20)}; }
  .hh-device { left: ${u(327.5)}; top: ${u(10)}; width: ${u(128)}; height: ${u(300)}; aspect-ratio: auto; transform: none; }
  .hh-slides { left: ${u(263)}; top: ${u(10)}; width: ${u(257)}; height: ${u(300)}; }
  .hh-dots   { left: ${u(391.5)}; top: ${u(334)}; bottom: auto; }

  .hh-offer { position: absolute; right: ${u(76)}; top: ${u(161.5)}; transform: translateY(-50%); width: ${u(128)}; align-items: flex-end; }
  .hh-offer .cap > span { left: auto; right: 0; }
  .hh-o-phones  { --fd: ${u(30)}; }
  .hh-o-and     { --fd: ${u(13)}; margin-top: ${u(9)}; }
  .hh-o-laptops { --fd: ${u(22)}; margin-top: ${u(9)}; }
  .hh-rule      { height: ${u(2)}; margin-top: ${u(16)}; }
  .hh-o-amazing { --fd: ${u(25)}; margin-top: ${u(15)}; }
  .hh-o-deals   { --fd: ${u(38)}; margin-top: ${u(10)}; }
  .hh-o-deals + .hh-rule { margin-top: ${u(17)}; }
  .hh-offer:hover .hh-o-deals > span { transform: translateX(-6px); }

  .hh-social { position: absolute; right: ${u(24)}; top: ${u(318)}; margin: 0; gap: ${u(7)}; }
  .hh-social a { width: ${u(18)}; height: ${u(18)}; }
  .hh-social svg { width: ${u(9)}; height: ${u(9)}; }
}

@media (prefers-reduced-motion: reduce) {
  .hh-script { animation: none; }
  .cap > span, .hh-social a, .hh-slide, .hh-dot { transition: none; }
}
`;

export default function Hero() {
  const n = SLIDES.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const go = (k) => setI(((k % n) + n) % n);

  // Auto-advance; restarts after every change (incl. manual), pauses on hover/touch
  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  return (
    <section className="hh-root">
      <style>{CSS}</style>
      <div className="hh-stage">
        <div className="hh-card">
          <div className="hh-clip" aria-hidden="true">
            <div className="hh-blob" />
          </div>

          {/* Headline */}
          <h1 className="hh-h1">
            <span className="cap hh-thin"><span>For the</span></span>
            <span className="cap hh-love"><span>Love</span></span>
            <span className="cap hh-of"><span>of</span></span>
            <span className="hh-script">honesty</span>
          </h1>

          {/* Centre visual: carousel */}
          <div className="hh-visual">
            <div className="hh-disc" />
            <div className="hh-ground" aria-hidden="true" />

            {n > 0 ? (
              <>
                <div
                  className="hh-slides"
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  onTouchStart={(e) => {
                    touchX.current = e.touches[0].clientX;
                    setPaused(true);
                  }}
                  onTouchEnd={(e) => {
                    const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
                    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
                    setPaused(false);
                  }}
                >
                  {SLIDES.map((src, k) => (
                    <img
                      key={k}
                      src={src}
                      alt=""
                      aria-hidden={k !== i}
                      draggable={false}
                      decoding="async"
                      className={`hh-slide ${k === i ? "hh-slide--on" : ""}`}
                    />
                  ))}
                </div>

                {n > 1 && (
                  <div className="hh-dots" role="group" aria-label="Hero slides">
                    {SLIDES.map((_, k) => (
                      <button
                        key={k}
                        type="button"
                        className={`hh-dot ${k === i ? "hh-dot--on" : ""}`}
                        onClick={() => go(k)}
                        aria-label={`Show slide ${k + 1}`}
                        aria-current={k === i}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="hh-device">
                {HERO_IMG ? <img src={HERO_IMG} alt="" /> : <PlaceholderDevice />}
              </div>
            )}
          </div>

          {/* Offer */}
          <Link to="/marketplace" className="hh-offer" aria-label="Phones and laptops. Amazing deals.">
            <span className="cap hh-o-phones"><span>Phones</span></span>
            <span className="cap hh-o-and"><span>and</span></span>
            <span className="cap hh-o-laptops"><span>Laptops</span></span>
            <span className="hh-rule" />
            <span className="cap hh-o-amazing"><span>Amazing</span></span>
            <span className="cap hh-o-deals"><span>Deals</span></span>
            <span className="hh-rule" />
          </Link>

          {/* Socials */}
          <ul className="hh-social">
            {SOCIALS.map(({ label, href, icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  {icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}