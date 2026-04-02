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
      const rotateY = offset * 6;
      const translateZ = -Math.abs(offset) * 20;
      const scale = 1 - Math.abs(offset) * 0.04;
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
      className={`
        group snap-center flex-shrink-0
        w-[82vw] max-w-[340px]
        lg:w-auto lg:max-w-none lg:flex-shrink
        bg-white border rounded-2xl p-8 flex flex-col gap-6
        transition-[border-color,box-shadow] duration-300 will-change-transform
        ${
          isActive
            ? "border-green shadow-[0_12px_40px_-10px_rgba(45,106,79,0.18)]"
            : "border-beige-dark hover:border-green"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div
          className={`
          w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-300
          ${
            isActive
              ? "bg-green-light border-green"
              : "bg-beige border-beige-dark group-hover:bg-green-light group-hover:border-green"
          }
        `}
        >
          <Icon
            size={22}
            className={`transition-colors duration-300 ${isActive ? "text-green" : "text-beige-text group-hover:text-green"}`}
            strokeWidth={1.75}
          />
        </div>
        <span
          className={`font-mono text-[4.5rem] font-black leading-none select-none transition-colors duration-300 ${isActive ? "text-[#c5d9cf]" : "text-beige-dark"}`}
        >
          {number}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-display font-extrabold text-black text-2xl leading-tight">
          {title}
        </h3>
        <p className="text-beige-text text-base leading-relaxed">{desc}</p>
      </div>

      <div className="flex items-start gap-2.5 bg-beige rounded-xl px-4 py-3 border border-beige-dark">
        <CheckCircle2
          size={15}
          className="text-green mt-0.5 flex-shrink-0"
          strokeWidth={2}
        />
        <p className="text-beige-text text-sm leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  // IntersectionObserver for active card + dots
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll("[data-index]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0.55) {
            setActiveIndex(parseInt(entry.target.dataset.index));
          }
        });
      },
      { root: track, threshold: 0.55 },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  // Mouse drag
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
    <section id="how-it-works" className="w-full bg-beige px-6 py-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-20">
          <h2 className="font-display text-5xl font-extrabold !text-green tracking-tight leading-[1.05] mb-5">
            From broken to fixed —<br />
            without the runaround.
          </h2>
          <p className="text-beige-text text-lg leading-relaxed">
            Most repair experiences in Nairobi are unpredictable. Wrong quotes,
            wrong technicians, wasted trips. Fixly is built to fix that — a
            structured four-step process that keeps you informed at every point.
          </p>
        </div>

        {/* ── Mobile: horizontal swipe track ── */}
        <div className="lg:hidden relative overflow-hidden mb-5">
          {/* Right-edge fade */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-beige to-transparent z-10" />

          <div
            ref={trackRef}
            className={`flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isGrabbing ? "cursor-grabbing" : "cursor-grab"}`}
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
          <div className="flex justify-center gap-1.5 pt-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const cards =
                    trackRef.current.querySelectorAll("[data-index]");
                  cards[i]?.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  });
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 bg-green" : "w-1.5 bg-beige-dark"}`}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop: 2-col grid ── */}
        <div className="hidden lg:grid grid-cols-2 gap-5 mb-5">
          {steps.map((step, i) => (
            <StepCard
              key={step.number}
              {...step}
              index={i}
              activeIndex={-1}
              trackRef={trackRef}
            />
          ))}
        </div>

        {/* Connector row (desktop only) */}
        <div className="hidden lg:flex items-center justify-center gap-3 mb-5 px-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 flex-1">
              <div className="flex-1 h-[1px] bg-beige-dark" />
              <ArrowRight size={16} className="text-beige-text flex-shrink-0" />
            </div>
          ))}
          <div className="flex-1 h-[1px] bg-beige-dark" />
        </div>

        {/* Guarantees strip */}
        <div className="bg-black rounded-2xl px-10 py-10">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-72 flex-shrink-0">
              <p className="font-display font-extrabold text-white text-2xl leading-snug mb-2">
                What you're guaranteed every time.
              </p>
              <p className="text-white-muted text-sm leading-relaxed">
                These aren't aspirations. They're the minimum standard for every
                Fixly job.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 flex-1">
              {guarantees.map((g) => (
                <div key={g} className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="text-green mt-0.5 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <span className="text-white-soft text-sm leading-relaxed">
                    {g}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-5 bg-white border border-beige-dark rounded-2xl px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display font-extrabold text-black text-2xl leading-tight">
              Ready to get started?
            </p>
            <p className="text-beige-text text-sm mt-1">
              Pick your device. We'll take it from there.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="/request/phone"
              className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-bold text-sm px-6 py-3 rounded-xl transition-colors duration-200"
            >
              Fix My Phone <ArrowRight size={15} strokeWidth={2.5} />
            </a>
            <a
              href="/request/laptop"
              className="flex items-center gap-2 bg-beige hover:bg-beige-dark border border-beige-dark text-black font-bold text-sm px-6 py-3 rounded-xl transition-colors duration-200"
            >
              Fix My Laptop <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
