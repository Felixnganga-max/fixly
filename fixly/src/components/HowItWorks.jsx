import {
  ClipboardList,
  UserCheck,
  MapPin,
  Wrench,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

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

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-beige px-6 py-28">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
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

        {/* ── Steps ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {steps.map(({ number, title, desc, icon: Icon, detail }, i) => (
            <div
              key={number}
              className="group bg-white border border-beige-dark rounded-2xl p-8 flex flex-col gap-6 hover:border-green transition-colors duration-300"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center border border-beige-dark group-hover:bg-green-light group-hover:border-green transition-colors duration-300">
                  <Icon
                    size={22}
                    className="text-beige-text group-hover:text-green transition-colors duration-300"
                    strokeWidth={1.75}
                  />
                </div>
                <span className="font-mono text-[4.5rem] font-black leading-none text-beige-dark select-none">
                  {number}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-3">
                <h3 className="font-display font-extrabold text-black text-2xl leading-tight">
                  {title}
                </h3>
                <p className="text-beige-text text-base leading-relaxed">
                  {desc}
                </p>
              </div>

              {/* Detail pill */}
              <div className="flex items-start gap-2.5 bg-beige rounded-xl px-4 py-3 border border-beige-dark">
                <CheckCircle2
                  size={15}
                  className="text-green mt-0.5 flex-shrink-0"
                  strokeWidth={2}
                />
                <p className="text-beige-text text-sm leading-relaxed">
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Connector row ── */}
        <div className="hidden lg:flex items-center justify-center gap-3 mb-5 px-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 flex-1">
              <div className="flex-1 h-[1px] bg-beige-dark" />
              <ArrowRight size={16} className="text-beige-text flex-shrink-0" />
            </div>
          ))}
          <div className="flex-1 h-[1px] bg-beige-dark" />
        </div>

        {/* ── Guarantees strip ── */}
        <div className="bg-black rounded-2xl px-10 py-10">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left */}
            <div className="lg:w-72 flex-shrink-0">
              <p className="font-display font-extrabold text-white text-2xl leading-snug mb-2">
                What you're guaranteed every time.
              </p>
              <p className="text-white-muted text-sm leading-relaxed">
                These aren't aspirations. They're the minimum standard for every
                Fixly job.
              </p>
            </div>

            {/* Right — guarantee list */}
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

        {/* ── Bottom CTA ── */}
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
              Fix My Phone
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
            <a
              href="/request/laptop"
              className="flex items-center gap-2 bg-beige hover:bg-beige-dark border border-beige-dark text-black font-bold text-sm px-6 py-3 rounded-xl transition-colors duration-200"
            >
              Fix My Laptop
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
