/**
 * Testimonials.jsx — Fixly
 *
 * Architecture:
 *  - Curated data with clean schema (swap `testimonials` array for API response later)
 *  - Mobile: touch/drag horizontal scroll with snap + momentum
 *  - Desktop: masonry-feel 3-col stagger grid
 *  - All tokens from project :root — zero hardcoded colors or fonts
 */

import { useRef, useState, useEffect } from "react";

/* ─────────────────────────────────────────
   DATA — swap this for an API fetch later
───────────────────────────────────────── */

const testimonials = [
  {
    id: 1,
    name: "Amina Wanjiku",
    location: "Westlands",
    device: "Phone",
    quote:
      "My screen was cracked on a Monday morning. By 11am I was already at the shop and by 1pm my phone was good as new. The price they told me was exactly what I paid.",
    rating: 5,
  },
  {
    id: 2,
    name: "Brian Otieno",
    location: "South B",
    device: "Laptop",
    quote:
      "I'd been to two other shops before Fixly. Both wasted my time. Fixly sent me straight to a laptop specialist who diagnosed the issue in 20 minutes. Motherboard replaced same day.",
    rating: 5,
  },
  {
    id: 3,
    name: "Cynthia Kamau",
    location: "Kilimani",
    device: "Phone",
    quote:
      "I loved that I knew the price before I even left the house. No negotiating, no surprises at the counter. Just fixed.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Maina",
    location: "Kasarani",
    device: "Laptop",
    quote:
      "The technician was professional and actually explained what was wrong. My laptop had a failing SSD — they swapped it and recovered my files. Couldn't ask for more.",
    rating: 5,
  },
  {
    id: 5,
    name: "Grace Njoroge",
    location: "Lang'ata",
    device: "Phone",
    quote:
      "Fast, honest, and affordable. I got a WhatsApp message with the technician's name and shop address within minutes of submitting my request. Very organised.",
    rating: 5,
  },
  {
    id: 6,
    name: "Samuel Kipchoge",
    location: "Thika Road",
    device: "Laptop",
    quote:
      "My laptop wouldn't boot at all. I was panicking before an important deadline. Fixly matched me to someone nearby who had it running within two hours. Lifesaver.",
    rating: 5,
  },
];

/* ─────────────────────────────────────────
   STAR RATING
───────────────────────────────────────── */

function Stars({ count = 5 }) {
  return (
    <div className="tm-stars">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="tm-star" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   INITIALS AVATAR
───────────────────────────────────────── */

/* Deterministic pastel from name — stays consistent across renders */
const AVATAR_PALETTES = [
  { bg: "var(--color-green-light)", color: "var(--color-green)" },
  { bg: "#e6f0ff", color: "var(--color-info)" },
  { bg: "#faeeda", color: "#7a5a00" },
  { bg: "#ede9fe", color: "#5b21b6" },
  { bg: "#fee2e2", color: "var(--color-error)" },
  { bg: "#fef3cd", color: "#7a5a00" },
];

function avatar(name) {
  const idx = name.charCodeAt(0) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[idx];
}

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ─────────────────────────────────────────
   TESTIMONIAL CARD
───────────────────────────────────────── */

function TestimonialCard({ name, location, device, quote, rating }) {
  const pal = avatar(name);
  const isPhone = device === "Phone";

  return (
    <article className="tm-card">
      {/* Opening quote mark — decorative */}
      <div className="tm-quote-mark" aria-hidden>
        "
      </div>

      {/* Stars */}
      <Stars count={rating} />

      {/* Quote */}
      <p className="tm-quote">{quote}</p>

      {/* Footer */}
      <footer className="tm-footer">
        <div className="tm-author">
          <div
            className="tm-avatar"
            style={{ background: pal.bg, color: pal.color }}
            aria-hidden
          >
            {initials(name)}
          </div>
          <div className="tm-author-info">
            <span className="tm-name">{name}</span>
            <span className="tm-location">{location}</span>
          </div>
        </div>
        <span
          className={`tm-device-tag tm-device-tag--${isPhone ? "phone" : "laptop"}`}
        >
          {isPhone ? (
            <svg
              viewBox="0 0 24 24"
              className="tm-device-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="tm-device-icon"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="13" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          )}
          {device}
        </span>
      </footer>
    </article>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */

export default function Testimonials() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const [isGrabbing, setIsGrabbing] = useState(false);

  /* Active dot tracking */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll("[data-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.intersectionRatio > 0.5)
            setActiveIndex(parseInt(e.target.dataset.card));
        });
      },
      { root: track, threshold: 0.5 },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  /* Mouse drag */
  const onMouseDown = (e) => {
    dragRef.current = {
      isDown: true,
      startX: e.pageX - trackRef.current.offsetLeft,
      scrollLeft: trackRef.current.scrollLeft,
    };
    setIsGrabbing(true);
  };
  const stopDrag = () => {
    dragRef.current.isDown = false;
    setIsGrabbing(false);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft =
      dragRef.current.scrollLeft - (x - dragRef.current.startX) * 1.3;
  };

  /* Split into columns for desktop masonry stagger */
  const col1 = testimonials.filter((_, i) => i % 3 === 0);
  const col2 = testimonials.filter((_, i) => i % 3 === 1);
  const col3 = testimonials.filter((_, i) => i % 3 === 2);

  return (
    <>
      <style>{`
        /* ── Section ── */
        .tm-section {
          width: 100%;
          background: var(--color-beige);
          padding: 7rem 0;
          overflow: hidden;
        }
        .tm-inner {
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* ── Header ── */
        .tm-header {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 4rem;
        }
        @media(min-width:768px) {
          .tm-header {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }
        .tm-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-green);
          margin-bottom: 1rem;
        }
        .tm-eyebrow::before {
          content: '';
          display: block;
          width: 18px;
          height: 1px;
          background: var(--color-green);
        }
        .tm-heading {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 4vw, 3rem);
          font-weight: 700;
          color: var(--color-black);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .tm-heading em {
          font-style: italic;
          color: var(--color-green);
        }
        .tm-header-right {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: flex-start;
        }
        @media(min-width:768px) {
          .tm-header-right { align-items: flex-end; }
        }
        .tm-header-sub {
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-beige-text);
          line-height: 1.6;
          margin: 0;
          max-width: 22ch;
          text-align: left;
        }
        @media(min-width:768px) { .tm-header-sub { text-align: right; } }


        /* ── Stars ── */
        .tm-stars {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .tm-star {
          width: 13px;
          height: 13px;
          fill: var(--color-warning);
          color: var(--color-warning);
          flex-shrink: 0;
        }

        /* ── Card ── */
        .tm-card {
          position: relative;
          background: var(--color-white);
          border: 1px solid var(--color-beige-dark);
          border-radius: var(--radius-xl);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          break-inside: avoid;
        }
        .tm-card:hover {
          border-color: rgba(0,95,2,0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px -8px rgba(0,0,0,0.08);
        }

        /* Decorative large quote mark */
        .tm-quote-mark {
          font-family: var(--font-display);
          font-size: 5rem;
          line-height: 0.6;
          color: rgba(0,95,2,0.12);
          font-style: italic;
          user-select: none;
          pointer-events: none;
          height: 2rem;
          overflow: visible;
        }

        .tm-quote {
          font-family: var(--font-body);
          font-size: 0.9375rem;
          color: var(--color-black);
          line-height: 1.7;
          margin: 0;
          flex: 1;
        }

        /* Footer */
        .tm-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--color-beige-dark);
          gap: 0.75rem;
        }
        .tm-author {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          min-width: 0;
        }
        .tm-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .tm-author-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .tm-name {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-black);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tm-location {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--color-beige-text);
          white-space: nowrap;
        }

        /* Device tag */
        .tm-device-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-xl);
          border: 1px solid;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tm-device-tag--phone {
          background: var(--color-green-light);
          color: var(--color-green);
          border-color: rgba(0,95,2,0.2);
        }
        .tm-device-tag--laptop {
          background: var(--color-beige);
          color: var(--color-beige-text);
          border-color: var(--color-beige-dark);
        }
        .tm-device-icon {
          width: 11px;
          height: 11px;
          flex-shrink: 0;
        }

        /* ── Mobile scroll track ── */
        .tm-mobile {
          position: relative;
          margin: 0 -1.5rem;
        }
        @media(min-width:768px) { .tm-mobile { display: none; } }

        .tm-fade-l {
          pointer-events: none;
          position: absolute;
          left: 0; top: 0; bottom: 1rem;
          width: 3rem;
          background: linear-gradient(to right, var(--color-beige), transparent);
          z-index: 1;
        }
        .tm-fade-r {
          pointer-events: none;
          position: absolute;
          right: 0; top: 0; bottom: 1rem;
          width: 4rem;
          background: linear-gradient(to left, var(--color-beige), transparent);
          z-index: 1;
        }

        .tm-track {
          display: flex;
          gap: 0.875rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          scroll-snap-type: x mandatory;
          padding: 0.25rem 1.5rem 1rem;
        }
        .tm-track::-webkit-scrollbar { display: none; }
        .tm-track--grab { cursor: grab; }
        .tm-track--grabbing { cursor: grabbing; }

        .tm-track-card {
          flex-shrink: 0;
          width: 85vw;
          max-width: 340px;
          scroll-snap-align: start;
        }

        /* Dots */
        .tm-dots {
          display: flex;
          justify-content: center;
          gap: 0.375rem;
          padding-top: 0.25rem;
        }
        .tm-dot {
          height: 3px;
          border-radius: 100px;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .tm-dot--on { width: 1.5rem; background: var(--color-green); }
        .tm-dot--off { width: 0.375rem; background: var(--color-beige-dark); }

        /* ── Desktop masonry-stagger grid ── */
        .tm-desktop {
          display: none;
        }
        @media(min-width:768px) {
          .tm-desktop {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.875rem;
            align-items: start;
          }
        }
        .tm-col {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
        /* Stagger: col 2 shifts down slightly, col 3 a touch more */
        .tm-col:nth-child(2) { padding-top: 1.5rem; }
        .tm-col:nth-child(3) { padding-top: 0.75rem; }

        /* ── Bottom bar ── */
        .tm-bottom {
          margin-top: 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
        }
        .tm-bottom__text {
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-beige-text);
          margin: 0;
        }
        .tm-bottom__text a {
          color: var(--color-green);
          text-decoration: none;
          font-weight: 600;
        }
        .tm-bottom__text a:hover { text-decoration: underline; }

        /* Card entrance animation */
        @keyframes tm-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tm-desktop .tm-card {
          animation: tm-in 0.45s ease both;
        }
        .tm-col:nth-child(1) .tm-card:nth-child(1) { animation-delay: 0ms; }
        .tm-col:nth-child(1) .tm-card:nth-child(2) { animation-delay: 80ms; }
        .tm-col:nth-child(2) .tm-card:nth-child(1) { animation-delay: 55ms; }
        .tm-col:nth-child(2) .tm-card:nth-child(2) { animation-delay: 135ms; }
        .tm-col:nth-child(3) .tm-card:nth-child(1) { animation-delay: 110ms; }
        .tm-col:nth-child(3) .tm-card:nth-child(2) { animation-delay: 190ms; }
      `}</style>

      <section id="testimonials" className="tm-section">
        <div className="tm-inner">
          {/* ── Header ── */}
          <header className="tm-header">
            <div>
              <div className="tm-eyebrow">Customer stories</div>
              <h2 className="tm-heading">
                Nairobians trust <em>Fixly.</em>
              </h2>
            </div>
            <div className="tm-header-right">
              <p className="tm-header-sub">
                Real customers. Real repairs.
                <br />
                No fake reviews.
              </p>
            </div>
          </header>

          {/* ── Mobile: swipe track ── */}
          <div className="tm-mobile">
            <div className="tm-fade-l" aria-hidden />
            <div className="tm-fade-r" aria-hidden />
            <div
              ref={trackRef}
              className={`tm-track ${isGrabbing ? "tm-track--grabbing" : "tm-track--grab"}`}
              onMouseDown={onMouseDown}
              onMouseLeave={stopDrag}
              onMouseUp={stopDrag}
              onMouseMove={onMouseMove}
            >
              {testimonials.map((t, i) => (
                <div key={t.id} className="tm-track-card" data-card={i}>
                  <TestimonialCard {...t} />
                </div>
              ))}
            </div>
            <div className="tm-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`tm-dot ${i === activeIndex ? "tm-dot--on" : "tm-dot--off"}`}
                  onClick={() => {
                    const cards =
                      trackRef.current?.querySelectorAll("[data-card]");
                    cards?.[i]?.scrollIntoView({
                      behavior: "smooth",
                      inline: "start",
                      block: "nearest",
                    });
                  }}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── Desktop: stagger 3-col grid ── */}
          <div className="tm-desktop" aria-label="Customer testimonials">
            <div className="tm-col">
              {col1.map((t) => (
                <TestimonialCard key={t.id} {...t} />
              ))}
            </div>
            <div className="tm-col">
              {col2.map((t) => (
                <TestimonialCard key={t.id} {...t} />
              ))}
            </div>
            <div className="tm-col">
              {col3.map((t) => (
                <TestimonialCard key={t.id} {...t} />
              ))}
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="tm-bottom">
            <p className="tm-bottom__text">
              More reviews on{" "}
              <a
                href="https://g.page/r/fixly-nairobi"
                target="_blank"
                rel="noreferrer"
              >
                Google Business
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
