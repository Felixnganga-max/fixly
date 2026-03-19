import { MessageCircle } from "lucide-react";

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

export default function Footer() {
  return (
    <footer className="w-full bg-beige border-t border-beige-dark px-6 pt-16 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <a
              href="/"
              className="font-display text-2xl font-extrabold text-black tracking-tight"
            >
              Fix<span className="text-green">ly</span>
            </a>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[220px]">
              Nairobi's verified repair network. Phones and laptops, done right.
            </p>
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-green hover:text-green-dark text-sm font-semibold transition-colors duration-200 w-fit"
            >
              <MessageCircle size={15} strokeWidth={2} />
              WhatsApp us
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-4">
              <h4
                className="font-display font-bold text-black text-xs tracking-widest uppercase"
                style={{ color: "#0D1117" }}
              >
                {group}
              </h4>
              <ul className="flex flex-col gap-3 list-none">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-gray-500 hover:text-black text-sm transition-colors duration-200"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-beige-dark">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Fixly. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs">Built for Nairobi 🇰🇪</p>
        </div>
      </div>
    </footer>
  );
}
