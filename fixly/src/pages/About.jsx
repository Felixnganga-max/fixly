import { useState } from "react";
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
  Smartphone,
  Laptop,
  Store,
} from "lucide-react";

const STATS = [
  { value: "500+", label: "Repairs completed" },
  { value: "48hr", label: "Average turnaround" },
  { value: "100%", label: "Verified technicians" },
  { value: "0", label: "Hidden charges" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Verified specialists only",
    desc: "Every technician on Fixly is individually vetted before they touch a single device. We verify specializations — screen repair is not the same as motherboard work, and we treat them differently.",
  },
  {
    icon: Clock,
    title: "Upfront, every time",
    desc: "You know the price range, the technician's name, their exact shop address, and how long the repair will take — before you leave your house. No surprises at the counter.",
  },
  {
    icon: Wrench,
    title: "Right specialist for the job",
    desc: "Phone specialists handle phones. Laptop specialists handle laptops. We run completely separate pipelines because the skills are not interchangeable.",
  },
  {
    icon: Users,
    title: "Admin oversight on every job",
    desc: "Our team manually reviews every request and assigns the right technician. If anything goes wrong, we step in. You are never on your own.",
  },
];

const SERVICES = [
  {
    icon: Wrench,
    tag: "Core service",
    title: "Phone & Laptop Repairs",
    desc: "Cracked screen. Dead battery. Won't turn on. Whatever the problem — we match you to a verified specialist who has fixed it a hundred times before. You get the technician's name, shop address, price range, and repair time before you move an inch.",
    cta: "Get a repair",
    href: "/request/phone",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&auto=format&fit=crop&q=80",
  },
  {
    icon: Store,
    tag: "Marketplace",
    title: "Buy Verified Devices",
    desc: "New, used, and refurbished phones and laptops — listed, verified, and priced transparently. No dodgy dealers, no inflated prices. Every device on the Fixly Marketplace has been assessed before it reaches you.",
    cta: "Browse marketplace",
    href: "/marketplace",
    image:
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&auto=format&fit=crop&q=80",
  },
];

const PROMISES = [
  "Upfront pricing before you leave home",
  "Verified specialists — phone and laptop, separate",
  "Admin oversight on every single job",
  "WhatsApp confirmation with full details",
  "Issue escalation if anything goes wrong",
  "No hidden costs, ever",
];

export default function About() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

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
    `w-full bg-white border rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200 ${
      err ? "border-error" : "border-beige-dark hover:border-gray-400"
    }`;

  return (
    <div className="min-h-screen bg-beige">
      {/* ── Hero ── */}
      <section className="w-full px-6 pt-10 pb-20 border-b border-beige-dark">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1
              className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-black leading-[1.04] tracking-tight mb-6"
              style={{ color: "#0D1117" }}
            >
              Nairobi's home for{" "}
              <span className="text-green">device care.</span>
            </h1>
            <p className="text-gray-500 text-xl leading-relaxed max-w-2xl mx-auto">
              Whether your screen is shattered, your laptop won't boot, or
              you're looking for your next device — Fixly is the one platform
              built to handle it properly. Repairs done right. Devices sourced
              honestly.
            </p>
          </div>

          {/* Hero image — full width */}
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=1400&auto=format&fit=crop&q=80"
              alt="Technician repairing a device"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            {/* Floating stat cards */}
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-center"
                >
                  <p
                    className="font-display font-extrabold text-2xl text-black leading-none"
                    style={{ color: "#0D1117" }}
                  >
                    {value}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Our story ── */}
      <section className="w-full px-6 py-20 border-b border-beige-dark">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative h-[420px] rounded-2xl overflow-hidden order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=800&auto=format&fit=crop&q=80"
              alt="Phone repair specialist at work"
              className="w-full h-full object-cover"
            />
            {/* Floating card */}
            <div className="absolute bottom-5 left-5 bg-white rounded-xl px-5 py-4 border border-beige-dark max-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2
                  size={14}
                  className="text-green"
                  strokeWidth={2.5}
                />
                <span className="text-green text-xs font-bold">
                  Verified technician
                </span>
              </div>
              <p
                className="text-black text-sm font-semibold"
                style={{ color: "#0D1117" }}
              >
                James Mwangi
              </p>
              <p className="text-gray-400 text-xs">Phone Specialist · CBD</p>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <span className="inline-block bg-white border border-beige-dark text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase w-fit">
              Our story
            </span>
            <h2
              className="font-display font-extrabold text-4xl text-black leading-tight"
              style={{ color: "#0D1117" }}
            >
              Built out of frustration.
              <br />
              <span className="text-green">Driven by trust.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              We built Fixly after one too many frustrating experiences — wrong
              quotes, unqualified technicians, wasted afternoons, and devices
              that came back worse than they went in.
            </p>
            <p className="text-gray-500 text-base leading-relaxed">
              The repair market in Nairobi isn't broken because of bad
              technicians. There are genuinely skilled people out there. The
              problem is the system — customers have no reliable way to find
              them, and technicians have no platform to build trust on.
            </p>
            <p className="text-gray-500 text-base leading-relaxed">
              Fixly is that system. We connect the right specialist to the right
              problem, give you a clear plan upfront, and stand behind every job
              we facilitate. Then we went further — because people don't just
              need repairs. They need a trusted place to buy their next device
              too.
            </p>
          </div>
        </div>
      </section>

      {/* ── What we do ── */}
      <section className="w-full px-6 py-20 border-b border-beige-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-white border border-beige-dark text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase mb-5">
              What we do
            </span>
            <h2
              className="font-display font-extrabold text-4xl text-black leading-tight"
              style={{ color: "#0D1117" }}
            >
              One platform. Two powerful services.
            </h2>
            <p className="text-gray-500 text-base mt-3 max-w-xl mx-auto">
              Fixly is built around a simple truth: people need their devices
              working, and they need to be able to trust where they get help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SERVICES.map(
              ({ icon: Icon, tag, title, desc, cta, href, image }) => (
                <div
                  key={title}
                  className="group bg-white border border-beige-dark rounded-2xl overflow-hidden hover:border-green hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-full h-52 overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Content */}
                  <div className="p-8 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center">
                        <Icon
                          size={15}
                          className="text-gray-500"
                          strokeWidth={1.75}
                        />
                      </div>
                      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                        {tag}
                      </span>
                    </div>
                    <h3
                      className="font-display font-extrabold text-2xl text-black"
                      style={{ color: "#0D1117" }}
                    >
                      {title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {desc}
                    </p>
                    <a
                      href={href}
                      className="flex items-center gap-2 text-green hover:text-green-dark font-semibold text-sm transition-colors duration-200 w-fit mt-2"
                    >
                      {cta} <ArrowRight size={14} strokeWidth={2.5} />
                    </a>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="w-full px-6 py-20 border-b border-beige-dark">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="inline-block bg-white border border-beige-dark text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase mb-5">
              How we work
            </span>
            <h2
              className="font-display font-extrabold text-4xl text-black leading-tight"
              style={{ color: "#0D1117" }}
            >
              The repair experience
              <br />
              was broken. We fixed it.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white border border-beige-dark rounded-2xl p-8 flex flex-col gap-5 hover:border-green transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center group-hover:bg-green-light group-hover:border-green transition-colors duration-300">
                  <Icon
                    size={20}
                    className="text-gray-500 group-hover:text-green transition-colors duration-300"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <h3
                    className="font-display font-bold text-black text-xl mb-2"
                    style={{ color: "#0D1117" }}
                  >
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promise banner ── */}
      <section className="w-full px-6 py-20 border-b border-beige-dark">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-black rounded-2xl overflow-hidden">
            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1400&auto=format&fit=crop&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="relative px-10 py-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display font-extrabold text-4xl text-white leading-tight mb-4">
                  We are not a directory.
                  <br />
                  <span className="text-green">We are the system.</span>
                </h2>
                <p className="text-white-muted text-base leading-relaxed">
                  Anyone can build a list of technicians. We built the
                  infrastructure around them — verification, matching,
                  communication, oversight, and accountability. When you use
                  Fixly, you have a team behind your device.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {PROMISES.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2
                      size={15}
                      className="text-green flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-white-soft text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marketplace visual ── */}
      <section className="w-full px-6 py-20 border-b border-beige-dark">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-block bg-white border border-beige-dark text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase w-fit">
              Fixly Marketplace
            </span>
            <h2
              className="font-display font-extrabold text-4xl text-black leading-tight"
              style={{ color: "#0D1117" }}
            >
              Your next device.
              <br />
              <span className="text-green">Sourced with confidence.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Finding a phone or laptop in Nairobi shouldn't feel like a gamble.
              The Fixly Marketplace lists new, used, and refurbished devices
              that have been vetted before they reach you — with transparent
              pricing and no middleman markup.
            </p>
            <p className="text-gray-500 text-base leading-relaxed">
              Phones and laptops only. Brands you know. Prices you can trust.
              And if anything goes wrong after your purchase, you already know
              where to find us.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                "Apple",
                "Samsung",
                "HP",
                "Dell",
                "Lenovo",
                "Xiaomi",
                "Tecno",
                "Asus",
              ].map((b) => (
                <span
                  key={b}
                  className="bg-white border border-beige-dark text-gray-500 text-xs font-semibold px-4 py-2 rounded-full"
                >
                  {b}
                </span>
              ))}
            </div>
            <a
              href="/marketplace"
              className="flex items-center gap-2 bg-green hover:bg-green-dark text-black font-bold text-sm px-6 py-3.5 rounded-xl transition-colors duration-200 w-fit mt-2"
            >
              Browse Marketplace <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>

          {/* Stacked device images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <div className="h-48 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80"
                  alt="Phone"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-36 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80"
                  alt="Laptop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-8">
              <div className="h-36 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80"
                  alt="MacBook"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-48 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&auto=format&fit=crop&q=80"
                  alt="Samsung"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="w-full px-6 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact info */}
          <div className="flex flex-col gap-8">
            <div>
              <span className="inline-block bg-white border border-beige-dark text-gray-500 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase mb-5">
                Contact
              </span>
              <h2
                className="font-display font-extrabold text-4xl text-black leading-tight"
                style={{ color: "#0D1117" }}
              >
                We're real people.
                <br />
                Talk to us.
              </h2>
              <p className="text-gray-500 text-base mt-4 leading-relaxed">
                Whether you have a question about a repair, want to list a
                device on the marketplace, want to join our technician network,
                or just want to say hello — we read every message.
              </p>
            </div>

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
                  className="group flex items-center gap-4 bg-white border border-beige-dark rounded-2xl px-6 py-5 hover:border-green transition-colors duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0 group-hover:bg-green-light group-hover:border-green transition-colors duration-300">
                    <Icon
                      size={18}
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
                    size={16}
                    className="text-gray-300 ml-auto group-hover:text-green transition-colors duration-200"
                  />
                </a>
              ))}

              <div className="flex items-center gap-4 bg-white border border-beige-dark rounded-2xl px-6 py-5">
                <div className="w-11 h-11 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
                  <MapPin
                    size={18}
                    className="text-gray-500"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-0.5">
                    Based in
                  </p>
                  <p
                    className="text-black font-semibold text-sm"
                    style={{ color: "#0D1117" }}
                  >
                    Nairobi, Kenya 🇰🇪
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white border border-beige-dark rounded-2xl p-8 flex flex-col gap-6 h-fit">
            {sent ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-light border border-green-dark/20 flex items-center justify-center">
                  <CheckCircle2
                    size={28}
                    className="text-green"
                    strokeWidth={2}
                  />
                </div>
                <h3
                  className="font-display font-extrabold text-2xl text-black"
                  style={{ color: "#0D1117" }}
                >
                  Message sent!
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  Thanks for reaching out. We'll get back to you on WhatsApp or
                  email within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", phone: "", message: "" });
                  }}
                  className="text-green text-sm font-semibold hover:text-green-dark transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h3
                    className="font-display font-bold text-black text-2xl"
                    style={{ color: "#0D1117" }}
                  >
                    Send us a message
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    We respond within 24 hours.
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
                    <label className="text-gray-500 text-xs font-medium">
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
                      <p className="text-error text-xs">{errors[key]}</p>
                    )}
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 text-xs font-medium">
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
                    <p className="text-error text-xs">{errors.message}</p>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-green hover:bg-green-dark disabled:opacity-60 text-black font-bold text-sm py-4 rounded-xl transition-colors duration-200"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Message <ArrowRight size={15} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
