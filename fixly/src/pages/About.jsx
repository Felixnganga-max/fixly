import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  ArrowRight,
  Wrench,
  ShieldCheck,
  Clock,
  Users,
  Loader2,
  Store,
  BadgeCheck,
  Star,
  Globe,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────
const STATS = [
  { value: "1,200+", label: "Repairs completed", sub: "and counting" },
  { value: "48hr", label: "Average turnaround", sub: "across all counties" },
  { value: "100%", label: "Verified technicians", sub: "no exceptions" },
  { value: "47", label: "Counties covered", sub: "all of Kenya" },
];

const COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Nyeri",
  "Meru",
  "Malindi",
  "Kitale",
  "Garissa",
  "Machakos",
  "Kisii",
  "Kakamega",
  "Kericho",
  "Embu",
  "Isiolo",
  "Lamu",
  "Nanyuki",
  "Voi",
  "Naivasha",
  "Muranga",
  "Kajiado",
  "Bungoma",
  "Migori",
];

const VALUES = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Verified specialists only",
    desc: "Every technician is individually vetted before they touch a single device. We verify specialisations — screen repair is not the same as motherboard work, and we treat them differently.",
  },
  {
    icon: Clock,
    number: "02",
    title: "Upfront, every time",
    desc: "You know the price range, the technician's name, their exact location, and how long the repair will take — before you leave your house. No surprises at the counter.",
  },
  {
    icon: Wrench,
    number: "03",
    title: "Right specialist for the job",
    desc: "Phone specialists handle phones. Laptop specialists handle laptops. We run completely separate pipelines because the skills are not interchangeable.",
  },
  {
    icon: Users,
    number: "04",
    title: "Admin oversight on every job",
    desc: "Our team manually reviews every request and assigns the right technician. If anything goes wrong, we step in. You are never on your own.",
  },
];

const SERVICES = [
  {
    icon: Wrench,
    tag: "Core service",
    title: "Phone & Laptop Repairs",
    desc: "Cracked screen. Dead battery. Won't turn on. We match you to a verified specialist who has fixed it a hundred times. Name, address, price range, and repair time — before you move an inch.",
    cta: "Get a repair",
    href: "/request/phone",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&auto=format&fit=crop&q=85",
  },
  {
    icon: Store,
    tag: "Marketplace",
    title: "Buy Verified Devices",
    desc: "New, used, and refurbished phones and laptops — listed, verified, priced transparently. No dodgy dealers, no inflated prices. Every device has been assessed before it reaches you.",
    cta: "Browse marketplace",
    href: "/marketplace",
    image:
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=900&auto=format&fit=crop&q=85",
  },
];

const PROMISES = [
  "Upfront pricing before you leave home",
  "Verified specialists — phones and laptops, separate",
  "Admin oversight on every single job",
  "WhatsApp confirmation with full details",
  "Issue escalation if anything goes wrong",
  "No hidden costs. Ever.",
];

const BRANDS = [
  "Apple",
  "Samsung",
  "HP",
  "Dell",
  "Lenovo",
  "Xiaomi",
  "Tecno",
  "Asus",
  "Huawei",
  "Infinix",
  "Nokia",
  "OnePlus",
];

const TESTIMONIALS = [
  {
    name: "Amina K.",
    city: "Mombasa",
    rating: 5,
    text: "My screen was fixed same day. The technician was exactly as described — professional and honest about the cost.",
  },
  {
    name: "Brian O.",
    city: "Kisumu",
    rating: 5,
    text: "Bought a verified Samsung from the marketplace. Arrived in perfect condition. Zero stress.",
  },
  {
    name: "Faith W.",
    city: "Nakuru",
    rating: 5,
    text: "They matched me to a laptop specialist within hours. I didn't even have to leave my office to get it arranged.",
  },
];

// ─── useInView ────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Reveal wrapper ───────────────────────────────────────────
function Reveal({ children, delay = 0, className = "", up = 32 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${up}px)`,
        transition: `opacity 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Marquee ──────────────────────────────────────────────────
function Marquee({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-beige-dark bg-white py-3 select-none">
      <div
        style={{
          animation: "marquee 32s linear infinite",
          display: "flex",
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "0 20px",
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {item}
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
              }}
            />
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
    </div>
  );
}

// ─── Tag pill ─────────────────────────────────────────────────
function Tag({ children }) {
  return (
    <span className="inline-block bg-white border border-beige-dark text-gray-400 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-[0.12em] uppercase">
      {children}
    </span>
  );
}

// ─── Stars ────────────────────────────────────────────────────
function Stars({ count = 5, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= count
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function About() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.message.trim()) e.message = "Please write a message";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  const inputCls = (err) =>
    [
      "w-full bg-beige border rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-gray-400",
      "outline-none transition-all duration-200 focus:bg-white",
      err
        ? "border-red-400 focus:border-red-500"
        : "border-beige-dark hover:border-gray-300 focus:border-green",
    ].join(" ");

  // ── hero animation helpers
  const show = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(22px)",
    transition: `opacity 0.85s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.85s cubic-bezier(.22,1,.36,1) ${delay}ms`,
  });

  return (
    <div className="min-h-screen bg-beige overflow-x-hidden">
      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative w-full border-b border-beige-dark">
        {/* eyebrow */}
        <div
          className="flex items-center justify-between px-6 sm:px-12 pt-8"
          style={show(0)}
        >
          <Tag>About Fixly</Tag>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Globe size={12} strokeWidth={2} />
            Serving all 47 counties · Kenya
          </div>
        </div>

        {/* headline */}
        <div className="px-6 sm:px-12 pt-14 pb-12 max-w-7xl mx-auto">
          <div style={show(80)} className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-green" />
            <span className="text-green text-xs font-bold tracking-widest uppercase">
              Kenya's device care platform
            </span>
          </div>

          <h1
            className="font-display font-extrabold leading-[1.02] tracking-tight mb-8"
            style={{
              ...show(160),
              fontSize: "clamp(2.8rem, 7.5vw, 6rem)",
              color: "#0D1117",
            }}
          >
            Every broken device
            <br />
            in Kenya deserves
            <br />
            <span className="text-green">a real fix.</span>
          </h1>

          <p
            className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-2xl mb-12"
            style={show(280)}
          >
            Whether your screen is shattered in Mombasa, your laptop won't boot
            in Kisumu, or you need a verified device in Eldoret — Fixly is the
            platform built to handle it properly. Repairs done right, across
            every county.
          </p>

          <div className="flex flex-wrap gap-4" style={show(380)}>
            <a
              href="/request/phone"
              className="group inline-flex items-center gap-2.5 bg-black hover:bg-green text-white hover:text-black font-bold text-sm px-7 py-4 rounded-xl transition-all duration-300"
            >
              Get a repair
              <ArrowRight
                size={15}
                strokeWidth={2.5}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </a>
            <a
              href="/marketplace"
              className="group inline-flex items-center gap-2.5 bg-white border border-beige-dark hover:border-black text-black font-bold text-sm px-7 py-4 rounded-xl transition-all duration-300"
            >
              Browse marketplace
              <ChevronRight
                size={15}
                strokeWidth={2.5}
                className="text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all"
              />
            </a>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative w-full h-72 sm:h-[420px]" style={show(460)}>
          <img
            src="https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=1600&auto=format&fit=crop&q=85"
            alt="Fixly technician at work"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.9)" }}
          />
          {/* gradients */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(249,247,242,0.55) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(249,247,242,0.5) 0%, transparent 50%)",
            }}
          />

          {/* floating: verified badge */}
          <div className="absolute top-5 right-5 sm:right-12 bg-white rounded-2xl px-5 py-3.5 border border-beige-dark shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <BadgeCheck size={12} className="text-green" strokeWidth={2.5} />
              <span className="text-green text-[10px] font-bold tracking-wide uppercase">
                Live match
              </span>
            </div>
            <p
              className="text-black text-sm font-semibold"
              style={{ color: "#0D1117" }}
            >
              James M. · Mombasa CBD
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              Screen specialist · Est. 45min · KES 2,800
            </p>
          </div>

          {/* floating: Kenya coverage */}
          <div
            className="absolute bottom-5 left-5 sm:left-12 rounded-2xl px-5 py-3.5"
            style={{
              background: "rgba(13,17,23,0.80)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="text-white text-xs font-semibold mb-0.5">
              🇰🇪 Operating across Kenya
            </p>
            <p className="text-gray-400 text-[10px]">
              Nairobi · Mombasa · Kisumu · Nakuru · +43 more
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          COUNTY MARQUEE
      ════════════════════════════════════════════ */}
      <Marquee items={COUNTIES} />

      {/* ════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════ */}
      <section className="w-full px-6 sm:px-12 py-24 border-b border-beige-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 lg:divide-x divide-beige-dark">
            {STATS.map(({ value, label, sub }, i) => (
              <Reveal
                key={label}
                delay={i * 90}
                className="lg:px-12 first:pl-0 last:pr-0"
              >
                <p
                  className="font-display font-extrabold text-5xl sm:text-6xl leading-none tracking-tight"
                  style={{ color: "#0D1117" }}
                >
                  {value}
                </p>
                <p className="text-sm font-semibold text-gray-700 mt-2">
                  {label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          OUR STORY
      ════════════════════════════════════════════ */}
      <section className="w-full px-6 sm:px-12 py-24 border-b border-beige-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* label */}
          <Reveal className="lg:col-span-2 pt-2">
            <Tag>Our story</Tag>
          </Reveal>

          {/* image */}
          <Reveal delay={100} className="lg:col-span-4">
            <div className="relative h-[480px] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=700&auto=format&fit=crop&q=85"
                alt="Technician at work"
                className="w-full h-full object-cover"
              />
              {/* floating card */}
              <div className="absolute bottom-5 left-5 right-5 bg-white rounded-xl px-4 py-4 border border-beige-dark">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2
                    size={12}
                    className="text-green"
                    strokeWidth={2.5}
                  />
                  <span className="text-green text-[10px] font-bold uppercase tracking-wide">
                    Verified technician
                  </span>
                </div>
                <p
                  className="text-black text-sm font-semibold"
                  style={{ color: "#0D1117" }}
                >
                  Faith Njoroge
                </p>
                <p className="text-gray-400 text-xs">
                  Laptop Specialist · Nakuru Town
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Stars count={5} size={10} />
                  <span className="text-gray-400 text-[10px] ml-0.5">
                    4.9 · 84 jobs
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* text */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Reveal>
              <h2
                className="font-display font-extrabold text-4xl sm:text-5xl leading-tight"
                style={{ color: "#0D1117" }}
              >
                Built out of frustration.
                <br />
                <span className="text-green">Driven by trust.</span>
              </h2>
            </Reveal>
            {[
              "We built Fixly after one too many frustrating experiences — wrong quotes, unqualified technicians, wasted afternoons, and devices that came back worse than they went in.",
              "The repair market across Kenya isn't broken because of bad technicians. There are genuinely skilled people in Mombasa, Kisumu, Nakuru, Eldoret and beyond. The problem is the system. Customers have no reliable way to find them, and technicians have no platform to build trust on.",
              "Fixly is that system — nationwide. We connect the right specialist to the right problem, give you a clear plan upfront, and stand behind every job we facilitate. Then we went further, because people don't just need repairs. They need a trusted place to buy their next device too.",
            ].map((t, i) => (
              <Reveal key={i} delay={(i + 1) * 80}>
                <p className="text-gray-500 text-base leading-relaxed">{t}</p>
              </Reveal>
            ))}
            <Reveal delay={350}>
              <div className="flex items-center gap-3 pt-2">
                <span className="w-8 h-px bg-green" />
                <span className="text-green text-xs font-bold tracking-widest uppercase">
                  All 47 counties. One platform.
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SERVICES
      ════════════════════════════════════════════ */}
      <section className="w-full px-6 sm:px-12 py-24 border-b border-beige-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <Reveal>
              <Tag>What we do</Tag>
              <h2
                className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mt-5"
                style={{ color: "#0D1117" }}
              >
                One platform.
                <br />
                Two powerful services.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-gray-500 text-base leading-relaxed max-w-xs sm:text-right">
                People need their devices working. They need to trust where they
                get help.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {SERVICES.map(
              ({ icon: Icon, tag, title, desc, cta, href, image }, idx) => (
                <Reveal key={title} delay={idx * 120}>
                  <a
                    href={href}
                    className="group block bg-white border border-beige-dark rounded-2xl overflow-hidden hover:border-green hover:shadow-xl transition-all duration-400 h-full"
                  >
                    <div className="w-full h-60 overflow-hidden relative">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
                      <div className="absolute top-5 left-5">
                        <span className="bg-white/90 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                          {tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col gap-4">
                      <div className="w-10 h-10 rounded-xl bg-beige border border-beige-dark flex items-center justify-center group-hover:bg-green-light group-hover:border-green transition-all duration-300">
                        <Icon
                          size={16}
                          className="text-gray-500 group-hover:text-green transition-colors duration-300"
                          strokeWidth={1.75}
                        />
                      </div>
                      <h3
                        className="font-display font-extrabold text-2xl"
                        style={{ color: "#0D1117" }}
                      >
                        {title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {desc}
                      </p>
                      <div className="flex items-center gap-2 text-green font-bold text-sm mt-1 group-hover:gap-3 transition-all duration-200">
                        {cta} <ArrowUpRight size={14} strokeWidth={2.5} />
                      </div>
                    </div>
                  </a>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          VALUES
      ════════════════════════════════════════════ */}
      <section className="w-full px-6 sm:px-12 py-24 border-b border-beige-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4">
            <Reveal>
              <Tag>How we work</Tag>
              <h2
                className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mt-6"
                style={{ color: "#0D1117" }}
              >
                The repair
                <br />
                experience was
                <br />
                broken.
                <br />
                <span className="text-green">We fixed it.</span>
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mt-6">
                Four principles governing every job on Fixly — from a screen
                replacement in Kisumu to a motherboard repair in Nairobi.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-8 flex flex-col divide-y divide-beige-dark">
            {VALUES.map(({ icon: Icon, number, title, desc }, idx) => (
              <Reveal key={title} delay={idx * 70}>
                <div className="group flex gap-8 py-8 hover:pl-2 transition-all duration-300 cursor-default">
                  <span
                    className="font-mono text-4xl font-bold flex-shrink-0 group-hover:text-green transition-colors duration-300 leading-none mt-1"
                    style={{ color: "#e5e3dc" }}
                  >
                    {number}
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center group-hover:bg-green-light group-hover:border-green transition-all duration-300">
                        <Icon
                          size={13}
                          className="text-gray-400 group-hover:text-green transition-colors duration-300"
                          strokeWidth={2}
                        />
                      </div>
                      <h3
                        className="font-display font-bold text-xl"
                        style={{ color: "#0D1117" }}
                      >
                        {title}
                      </h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROMISE BANNER
      ════════════════════════════════════════════ */}
      <section className="w-full px-6 sm:px-12 py-24 border-b border-beige-dark">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1600&auto=format&fit=crop&q=80"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-[0.14]"
              />
              {/* green left accent bar */}
              <div className="absolute top-0 left-0 w-1 h-full bg-green" />

              <div className="relative px-10 sm:px-16 py-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                <div>
                  <span className="inline-block border border-white/20 text-white/40 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-[0.12em] uppercase mb-7">
                    Our promise
                  </span>
                  <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight mb-6">
                    We are not a directory.
                    <br />
                    <span className="text-green">We are the system.</span>
                  </h2>
                  <p className="text-white/50 text-base leading-relaxed">
                    Anyone can build a list of technicians. We built the
                    infrastructure around them — verification, matching,
                    communication, oversight, accountability. From Nairobi to
                    Garissa, Mombasa to Kisumu. When you use Fixly, you have a
                    whole team behind your device.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  {PROMISES.map((item) => (
                    <div key={item} className="flex items-center gap-3.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(34,197,94,0.3)",
                        }}
                      >
                        <CheckCircle2
                          size={11}
                          className="text-green"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className="text-white/65 text-sm font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          MARKETPLACE
      ════════════════════════════════════════════ */}
      <section className="w-full px-6 sm:px-12 py-24 border-b border-beige-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-7">
            <Reveal>
              <Tag>Fixly Marketplace</Tag>
              <h2
                className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mt-6"
                style={{ color: "#0D1117" }}
              >
                Your next device.
                <br />
                <span className="text-green">Sourced with confidence.</span>
              </h2>
            </Reveal>
            {[
              "Finding a phone or laptop in Kenya shouldn't feel like a gamble. The Fixly Marketplace lists new, used, and refurbished devices vetted before they reach you — transparent pricing, no middleman markup, available nationwide.",
              "Phones and laptops only. Brands you know. Prices you can trust. Delivery across Kenya via G4S. And if anything goes wrong after purchase, you already know where to find us.",
            ].map((t, i) => (
              <Reveal key={i} delay={(i + 1) * 80}>
                <p className="text-gray-500 text-base leading-relaxed">{t}</p>
              </Reveal>
            ))}
            <Reveal delay={200}>
              <div className="flex flex-wrap gap-2">
                {BRANDS.map((b) => (
                  <span
                    key={b}
                    className="bg-white border border-beige-dark text-gray-500 text-xs font-semibold px-4 py-2 rounded-full hover:border-green hover:text-green transition-all duration-200 cursor-default"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={280}>
              <a
                href="/marketplace"
                className="group inline-flex items-center gap-2.5 bg-green hover:bg-green-dark text-black font-bold text-sm px-7 py-4 rounded-xl transition-all duration-200 w-fit"
              >
                Browse Marketplace
                <ArrowRight
                  size={15}
                  strokeWidth={2.5}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </a>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-3">
                <div className="h-52 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=85"
                    alt="Phone"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="h-36 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=85"
                    alt="Laptop"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-10">
                <div className="h-36 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=85"
                    alt="MacBook"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="h-52 rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=500&auto=format&fit=crop&q=85"
                    alt="Samsung"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════════ */}
      <section className="w-full px-6 sm:px-12 py-24 border-b border-beige-dark">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
            <Reveal>
              <Tag>What people say</Tag>
              <h2
                className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mt-5"
                style={{ color: "#0D1117" }}
              >
                From Mombasa
                <br />
                to Nakuru.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex items-center gap-2">
                <Stars count={5} size={15} />
                <span className="text-gray-400 text-sm ml-1">
                  4.9 average · 300+ reviews
                </span>
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, city, text, rating }, idx) => (
              <Reveal key={name} delay={idx * 90}>
                <div className="bg-white border border-beige-dark rounded-2xl p-7 flex flex-col gap-5 h-full hover:border-green hover:shadow-md transition-all duration-300">
                  <Stars count={rating} size={12} />
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    "{text}"
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-beige-dark">
                    <div className="w-8 h-8 rounded-full bg-green-light border border-green-dark/20 flex items-center justify-center text-green text-xs font-bold flex-shrink-0">
                      {name[0]}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#0D1117" }}
                      >
                        {name}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <MapPin size={9} strokeWidth={2} />
                        {city}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════════ */}
      <section id="contact" className="w-full px-6 sm:px-12 py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div className="flex flex-col gap-10">
            <Reveal>
              <Tag>Contact</Tag>
              <h2
                className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mt-6"
                style={{ color: "#0D1117" }}
              >
                We're real people.
                <br />
                <span className="text-green">Talk to us.</span>
              </h2>
              <p className="text-gray-500 text-base mt-5 leading-relaxed">
                Repair question, device listing, technician application, or just
                a hello — we read every message, from every county.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: Mail,
                    label: "Email us",
                    value: "info@fixly.co.ke",
                    href: "mailto:info@fixly.co.ke",
                  },
                  {
                    icon: Phone,
                    label: "Call us",
                    value: "+254 797 743 366",
                    href: "tel:+254797743366",
                  },
                  {
                    icon: MessageCircle,
                    label: "WhatsApp",
                    value: "+254 797 743 366",
                    href: "https://wa.me/254797743366",
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center gap-4 bg-white border border-beige-dark rounded-2xl px-6 py-5 hover:border-green transition-all duration-200"
                  >
                    <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 group-hover:bg-green-light group-hover:border-green transition-all duration-300">
                      <Icon
                        size={17}
                        className="text-gray-500 group-hover:text-green transition-colors duration-300"
                        strokeWidth={1.75}
                      />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-medium mb-0.5">
                        {label}
                      </p>
                      <p
                        className="text-black font-semibold text-sm"
                        style={{ color: "#0D1117" }}
                      >
                        {value}
                      </p>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-gray-300 ml-auto group-hover:text-green group-hover:translate-x-0.5 transition-all duration-200"
                    />
                  </a>
                ))}

                <div className="flex items-center gap-4 bg-white border border-beige-dark rounded-2xl px-6 py-5">
                  <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
                    <Globe
                      size={17}
                      className="text-gray-500"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-0.5">
                      Serving
                    </p>
                    <p
                      className="text-black font-semibold text-sm"
                      style={{ color: "#0D1117" }}
                    >
                      All 47 counties · Kenya 🇰🇪
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={140}>
            <div className="bg-white border border-beige-dark rounded-2xl p-8 flex flex-col gap-6">
              {sent ? (
                <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-light border border-green-dark/20 flex items-center justify-center">
                    <CheckCircle2
                      size={28}
                      className="text-green"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-display font-extrabold text-2xl"
                      style={{ color: "#0D1117" }}
                    >
                      Message sent!
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mt-2">
                      Thanks for reaching out. We'll get back to you on WhatsApp
                      or email within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({ name: "", phone: "", message: "" });
                    }}
                    className="text-green text-sm font-bold hover:text-green-dark transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h3
                      className="font-display font-bold text-2xl"
                      style={{ color: "#0D1117" }}
                    >
                      Send us a message
                    </h3>
                    <p className="text-gray-400 text-sm mt-1.5">
                      We respond within 24 hours, anywhere in Kenya.
                    </p>
                  </div>

                  {[
                    {
                      key: "name",
                      label: "Your Name",
                      type: "text",
                      placeholder: "e.g. Amina Wanjiku",
                    },
                    {
                      key: "phone",
                      label: "Phone / WhatsApp",
                      type: "tel",
                      placeholder: "e.g. 0712 345 678",
                    },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        {label}
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={set(key)}
                        className={inputCls(errors[key])}
                      />
                      {errors[key] && (
                        <p className="text-red-500 text-xs">{errors[key]}</p>
                      )}
                    </div>
                  ))}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      Message
                    </label>
                    <textarea
                      placeholder="Tell us what's on your mind..."
                      value={form.message}
                      onChange={set("message")}
                      rows={5}
                      className={`${inputCls(errors.message)} resize-none`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs">{errors.message}</p>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={sending}
                    className="group w-full flex items-center justify-center gap-2.5 bg-green hover:bg-green-dark disabled:opacity-60 text-black font-bold text-sm py-4 rounded-xl transition-all duration-200"
                  >
                    {sending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message{" "}
                        <ArrowRight
                          size={15}
                          strokeWidth={2.5}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
