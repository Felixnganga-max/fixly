/**
 * HowItWorks.jsx — Fixly
 *
 * Refined, delicate, professional.
 * All tokens from project :root — no hardcoded colors or fonts.
 */

import {
  ClipboardList,
  UserCheck,
  MapPin,
  Wrench,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Describe your issue",
    desc: "Tell us what's wrong with your device. Takes about 60 seconds. No technical knowledge needed — just tell us what happened in plain language.",
    icon: ClipboardList,
    detail:
      "Name, phone number, location, and a brief description is all we need to get started.",
  },
  {
    number: "02",
    title: "We match a specialist",
    desc: "Our team reviews your request and selects the most qualified, available technician for your specific problem — not just whoever is closest.",
    icon: UserCheck,
    detail:
      "Every technician is individually verified. Phone and laptop specialists are kept separate.",
  },
  {
    number: "03",
    title: "You get a clear plan",
    desc: "We send you the technician's name, their shop address, an estimated price range, and a realistic repair time — all before you leave your house.",
    icon: MapPin,
    detail:
      "Delivered straight to your WhatsApp. No app needed, no login required.",
  },
  {
    number: "04",
    title: "Device fixed. Done.",
    desc: "Walk into the shop, hand over your device, and get it back working. The technician already knows you're coming and what the problem is.",
    icon: Wrench,
    detail:
      "No surprises at the counter. The price you were told is the price you pay.",
  },
];

const guarantees = [
  "Upfront pricing before you leave home",
  "Verified specialists only — no generalists",
  "Separate phone and laptop pipelines",
  "Admin oversight on every single job",
  "Issue escalation if anything goes wrong",
  "WhatsApp updates throughout the process",
];

/* ─────────────────────────────────────────
   STEP CARD
───────────────────────────────────────── */

function StepCard({
  number,
  title,
  desc,
  icon: Icon,
  detail,
  index,
  activeIndex,
  trackRef,
}) {
  const cardRef = useRef(null);
  const isActive = activeIndex === index;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handleScroll = () => {
      if (!cardRef.current) return;
      const trackRect = track.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const offset = (cardCenterX - centerX) / (trackRect.width / 2);
      const rotateY = offset * 5;
      const translateZ = -Math.abs(offset) * 18;
      const scale = 1 - Math.abs(offset) * 0.035;
      cardRef.current.style.transform = `perspective(900px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`;
    };
    track.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => track.removeEventListener("scroll", handleScroll);
  }, [trackRef]);

  return (
    <div
      ref={cardRef}
      data-index={index}
      style={{
        "--card-active-border": isActive ? "var(--color-green)" : undefined,
      }}
      className={`
        hiw-card group snap-center flex-shrink-0
        w-[82vw] max-w-[340px]
        lg:w-auto lg:max-w-none lg:flex-shrink
        transition-all duration-300 will-change-transform
        ${isActive ? "hiw-card--active" : ""}
      `}
    >
      {/* Step number — extremely light, decorative */}
      <div className="hiw-card__number">{number}</div>

      {/* Icon */}
      <div
        className={`hiw-card__icon-wrap ${isActive ? "hiw-card__icon-wrap--active" : ""}`}
      >
        <Icon
          size={18}
          strokeWidth={1.6}
          className={`transition-colors duration-300 ${isActive ? "text-green" : "text-beige-text group-hover:text-green"}`}
        />
      </div>

      {/* Copy */}
      <div className="hiw-card__body">
        <h3 className="hiw-card__title">{title}</h3>
        <p className="hiw-card__desc">{desc}</p>
      </div>

      {/* Detail pill */}
      <div className="hiw-card__detail">
        <CheckCircle2
          size={13}
          className="text-green flex-shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <p className="hiw-card__detail-text">{detail}</p>
      </div>

      {/* Subtle step line connector — desktop only, not on last card */}
      {index < steps.length - 1 && (
        <div className="hiw-card__connector" aria-hidden />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */

export default function HowItWorks() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll("[data-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0.55)
            setActiveIndex(parseInt(entry.target.dataset.index));
        });
      },
      { root: track, threshold: 0.55 },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const onMouseDown = (e) => {
    dragRef.current = {
      isDown: true,
      startX: e.pageX - trackRef.current.offsetLeft,
      scrollLeft: trackRef.current.scrollLeft,
    };
    setIsGrabbing(true);
  };
  const onMouseLeave = () => {
    dragRef.current.isDown = false;
    setIsGrabbing(false);
  };
  const onMouseUp = () => {
    dragRef.current.isDown = false;
    setIsGrabbing(false);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.isDown) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - dragRef.current.startX) * 1.4;
    trackRef.current.scrollLeft = dragRef.current.scrollLeft - walk;
  };

  return (
    <>
      {/* ── Scoped styles using project tokens only ── */}
      <style>{`
        /* ── Section shell ── */
        .hiw-section {
          width: 100%;
          background: var(--color-beige);
          padding: 7rem 1.5rem;
        }
        .hiw-inner {
          max-width: 72rem;
          margin: 0 auto;
        }

        /* ── Header ── */
        .hiw-header {
          max-width: 38rem;
          margin-bottom: 5rem;
        }
        .hiw-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-green);
          margin-bottom: 1.25rem;
        }
        .hiw-eyebrow::before {
          content: '';
          display: block;
          width: 18px;
          height: 1px;
          background: var(--color-green);
        }
        .hiw-heading {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 4vw, 3rem);
          font-weight: 700;
          color: var(--color-black);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 1.25rem;
        }
        .hiw-heading em {
          font-style: italic;
          color: var(--color-green);
        }
        .hiw-subhead {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--color-beige-text);
          line-height: 1.7;
          margin: 0;
        }

        /* ── Step cards ── */
        .hiw-card {
          position: relative;
          background: var(--color-white);
          border: 1px solid var(--color-beige-dark);
          border-radius: var(--radius-xl);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .hiw-card:hover {
          border-color: rgba(0,95,2,0.25);
          box-shadow: 0 8px 32px -8px rgba(0,0,0,0.08);
        }
        .hiw-card--active {
          border-color: var(--color-green);
          box-shadow: 0 12px 40px -10px rgba(0,95,2,0.12);
        }

        /* Decorative step number */
        .hiw-card__number {
          font-family: var(--font-mono);
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1;
          color: var(--color-beige-dark);
          letter-spacing: -0.04em;
          user-select: none;
          transition: color 0.25s ease;
        }
        .hiw-card--active .hiw-card__number {
          color: rgba(0,95,2,0.15);
        }

        /* Icon wrapper */
        .hiw-card__icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          background: var(--color-beige);
          border: 1px solid var(--color-beige-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .hiw-card:hover .hiw-card__icon-wrap,
        .hiw-card__icon-wrap--active {
          background: var(--color-green-light);
          border-color: rgba(0,95,2,0.2);
        }

        .hiw-card__body { display: flex; flex-direction: column; gap: 0.5rem; }
        .hiw-card__title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-black);
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .hiw-card__desc {
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-beige-text);
          line-height: 1.65;
          margin: 0;
        }

        /* Detail pill */
        .hiw-card__detail {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          background: var(--color-beige);
          border: 1px solid var(--color-beige-dark);
          border-radius: var(--radius-lg);
          padding: 0.65rem 0.9rem;
        }
        .hiw-card__detail-text {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          color: var(--color-beige-text);
          line-height: 1.6;
          margin: 0;
        }

        /* ── Mobile track ── */
        .hiw-mobile { position: relative; overflow: hidden; margin-bottom: 1.25rem; }
        @media(min-width:1024px) { .hiw-mobile { display: none; } }

        .hiw-track {
          display: flex;
          gap: 0.875rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          snap-type: x mandatory;
          padding: 0.25rem 1.5rem 1rem;
          margin: 0 -1.5rem;
        }
        .hiw-track::-webkit-scrollbar { display: none; }
        .hiw-track.grabbing { cursor: grabbing; }
        .hiw-track:not(.grabbing) { cursor: grab; }

        .hiw-fade-r {
          pointer-events: none;
          position: absolute;
          right: 0; top: 0; bottom: 1rem;
          width: 3rem;
          background: linear-gradient(to left, var(--color-beige), transparent);
          z-index: 1;
        }

        /* Dots */
        .hiw-dots {
          display: flex;
          justify-content: center;
          gap: 0.375rem;
        }
        .hiw-dot {
          height: 3px;
          border-radius: 100px;
          border: none;
          padding: 0;
          background: var(--color-beige-dark);
          cursor: pointer;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .hiw-dot--active {
          width: 1.5rem;
          background: var(--color-green);
        }
        .hiw-dot:not(.hiw-dot--active) { width: 0.375rem; }

        /* ── Desktop grid ── */
        .hiw-grid {
          display: none;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.875rem;
          margin-bottom: 0.875rem;
        }
        @media(min-width:1024px) { .hiw-grid { display: grid; } }

        /* Connector */
        .hiw-connector {
          display: none;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.875rem;
          padding: 0 2rem;
        }
        @media(min-width:1024px) { .hiw-connector { display: flex; } }
        .hiw-connector__line { flex: 1; height: 1px; background: var(--color-beige-dark); }
        .hiw-connector__arrow { color: var(--color-beige-dark); flex-shrink: 0; }

        /* ── Guarantees strip ── */
        .hiw-guarantees {
          background: var(--color-black);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          margin-bottom: 0.875rem;
        }
        .hiw-guarantees__inner {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        @media(min-width:1024px) {
          .hiw-guarantees__inner { flex-direction: row; align-items: flex-start; }
        }
        .hiw-guarantees__lead { flex-shrink: 0; }
        @media(min-width:1024px) { .hiw-guarantees__lead { width: 16rem; } }
        .hiw-guarantees__heading {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--color-white);
          line-height: 1.3;
          margin: 0 0 0.5rem;
          letter-spacing: -0.01em;
        }
        .hiw-guarantees__sub {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          color: var(--color-white-muted);
          line-height: 1.6;
          margin: 0;
        }
        .hiw-guarantees__list {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.875rem 2.5rem;
        }
        @media(min-width:640px) { .hiw-guarantees__list { grid-template-columns: 1fr 1fr; } }
        .hiw-guarantee-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }
        .hiw-guarantee-text {
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-white-soft);
          line-height: 1.55;
        }

        /* Divider line inside guarantees */
        .hiw-guarantees__divider {
          width: 1px;
          background: var(--color-black-border);
          align-self: stretch;
          flex-shrink: 0;
          display: none;
        }
        @media(min-width:1024px) { .hiw-guarantees__divider { display: block; } }

        /* ── Bottom CTA ── */
        .hiw-cta {
          background: var(--color-white);
          border: 1px solid var(--color-beige-dark);
          border-radius: var(--radius-xl);
          padding: 2rem 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          align-items: flex-start;
        }
        @media(min-width:640px) {
          .hiw-cta {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .hiw-cta__heading {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-black);
          line-height: 1.2;
          letter-spacing: -0.01em;
          margin: 0 0 0.25rem;
        }
        .hiw-cta__sub {
          font-family: var(--font-body);
          font-size: 0.8125rem;
          color: var(--color-beige-text);
          margin: 0;
        }
        .hiw-cta__actions {
          display: flex;
          gap: 0.625rem;
          flex-shrink: 0;
        }

        /* Buttons */
        .hiw-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 700;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-lg);
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .hiw-btn:active { transform: scale(0.98); }

        .hiw-btn--primary {
          background: var(--color-green);
          color: var(--color-white);
        }
        .hiw-btn--primary:hover {
          background: var(--color-green-dark);
          box-shadow: 0 4px 14px rgba(0,95,2,0.25);
        }

        .hiw-btn--secondary {
          background: var(--color-beige);
          color: var(--color-black);
          border: 1px solid var(--color-beige-dark);
        }
        .hiw-btn--secondary:hover {
          background: var(--color-beige-dark);
        }
      `}</style>

      <section id="how-it-works" className="hiw-section">
        <div className="hiw-inner">
          {/* ── Header ── */}
          <header className="hiw-header">
            <span className="hiw-eyebrow">How it works</span>
            <h2 className="hiw-heading">
              From broken to fixed —<br />
              <em>without the runaround.</em>
            </h2>
            <p className="hiw-subhead">
              Most repair experiences in Nairobi are unpredictable. Wrong
              quotes, wrong technicians, wasted trips. Fixly is built to fix
              that — a structured four-step process that keeps you informed at
              every point.
            </p>
          </header>

          {/* ── Mobile: horizontal swipe track ── */}
          <div className="hiw-mobile">
            <div className="hiw-fade-r" />
            <div
              ref={trackRef}
              className={`hiw-track${isGrabbing ? " grabbing" : ""}`}
              onMouseDown={onMouseDown}
              onMouseLeave={onMouseLeave}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
            >
              {steps.map((step, i) => (
                <StepCard
                  key={step.number}
                  {...step}
                  index={i}
                  activeIndex={activeIndex}
                  trackRef={trackRef}
                />
              ))}
            </div>

            {/* Progress dots */}
            <div className="hiw-dots">
              {steps.map((_, i) => (
                <button
                  key={i}
                  className={`hiw-dot${i === activeIndex ? " hiw-dot--active" : ""}`}
                  onClick={() => {
                    const cards =
                      trackRef.current.querySelectorAll("[data-index]");
                    cards[i]?.scrollIntoView({
                      behavior: "smooth",
                      inline: "center",
                      block: "nearest",
                    });
                  }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── Desktop: 4-col grid ── */}
          <div className="hiw-grid">
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                {...step}
                index={i}
                activeIndex={-1}
                trackRef={{ current: null }}
              />
            ))}
          </div>

          {/* Connector row */}
          <div className="hiw-connector" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flex: 1,
                }}
              >
                <div className="hiw-connector__line" />
                <ArrowRight
                  size={14}
                  className="hiw-connector__arrow"
                  strokeWidth={1.5}
                />
              </div>
            ))}
            <div className="hiw-connector__line" style={{ flex: 1 }} />
          </div>

          {/* ── Guarantees ── */}
          <div className="hiw-guarantees">
            <div className="hiw-guarantees__inner">
              <div className="hiw-guarantees__lead">
                <p className="hiw-guarantees__heading">
                  What you're guaranteed, every time.
                </p>
                <p className="hiw-guarantees__sub">
                  These aren't aspirations. They're the minimum standard for
                  every Fixly job.
                </p>
              </div>

              <div className="hiw-guarantees__divider" />

              <ul
                className="hiw-guarantees__list"
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {guarantees.map((g) => (
                  <li key={g} className="hiw-guarantee-item">
                    <CheckCircle2
                      size={14}
                      className="text-green flex-shrink-0"
                      style={{ marginTop: "2px", color: "var(--color-green)" }}
                      strokeWidth={2}
                    />
                    <span className="hiw-guarantee-text">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div className="hiw-cta">
            <div>
              <p className="hiw-cta__heading">Ready to get started?</p>
              <p className="hiw-cta__sub">
                Pick your device. We'll take it from there.
              </p>
            </div>
            <div className="hiw-cta__actions">
              <a href="/request/phone" className="hiw-btn hiw-btn--primary">
                Fix my phone <ArrowRight size={13} strokeWidth={2.5} />
              </a>
              <a href="/request/laptop" className="hiw-btn hiw-btn--secondary">
                Fix my laptop <ArrowRight size={13} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
