import { useState } from "react";
import { Smartphone, Laptop, ChevronDown, Lock } from "lucide-react";

const navLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "About Us", href: "/about-us" },
];

// ── Logo component — swap the variant you prefer ──────────────
function Logo() {
  return (
    <a href="/" className="flex items-center select-none">
      {/*
        VARIANT A (current pick):
        "Fix" in black, "ly" in bright lime green, small wrench-dot above the i
        Clean, modern, the green pops much more than Tailwind's default green
      */}
      <span
        className="font-display font-extrabold tracking-tight leading-none"
        style={{ fontSize: "1.6rem", letterSpacing: "-0.04em" }}
      >
        <span style={{ color: "#0D1117" }}>Fix</span>
        <span style={{ color: "#16a34a" }}>ly</span>
      </span>
    </a>
  );

  /*
    VARIANT B — pill badge style:
    "fix" on dark background, "ly" in bright green — like a tag

    return (
      <a href="/" className="flex items-center select-none">
        <span
          className="font-display font-extrabold tracking-tight leading-none px-3 py-1 rounded-lg"
          style={{ fontSize: "1.4rem", letterSpacing: "-0.04em", background: "#0D1117" }}
        >
          <span style={{ color: "#fff" }}>fix</span>
          <span style={{ color: "#16a34a" }}>ly</span>
        </span>
      </a>
    );

    VARIANT C — dot accent:
    A bright green dot sits before the name like a status indicator

    return (
      <a href="/" className="flex items-center gap-2 select-none">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#16a34a", boxShadow: "0 0 8px #16a34a" }}
        />
        <span
          className="font-display font-extrabold tracking-tight leading-none"
          style={{ fontSize: "1.6rem", letterSpacing: "-0.04em", color: "#0D1117" }}
        >
          fixly
        </span>
      </a>
    );
  */
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-beige border-b border-beige-dark">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="!text-gray-500 hover:!text-black text-sm font-medium transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 !text-gray-500 hover:!text-black text-sm font-medium transition-colors duration-200"
            >
              <Lock size={13} strokeWidth={2} />
              Admin
            </a>

            <div className="relative">
              <button
                onClick={() => setDeviceOpen(!deviceOpen)}
                className="inline-flex items-center gap-2 bg-green hover:bg-green-dark !text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors duration-200"
              >
                Get a Repair
                <ChevronDown
                  size={14}
                  strokeWidth={2.5}
                  className={`transition-transform duration-200 ${deviceOpen ? "rotate-180" : ""}`}
                />
              </button>

              {deviceOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-beige-dark rounded-xl overflow-hidden shadow-sm">
                  <a
                    href="/request/phone"
                    onClick={() => setDeviceOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm !text-gray-500 hover:!text-black hover:bg-beige transition-colors duration-150"
                  >
                    <Smartphone
                      size={15}
                      strokeWidth={1.75}
                      className="text-green"
                    />
                    Fix My Phone
                  </a>
                  <div className="border-t border-beige-dark" />
                  <a
                    href="/request/laptop"
                    onClick={() => setDeviceOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm !text-gray-500 hover:!text-black hover:bg-beige transition-colors duration-150"
                  >
                    <Laptop
                      size={15}
                      strokeWidth={1.75}
                      className="text-green"
                    />
                    Fix My Laptop
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => {
              setMenuOpen(!menuOpen);
              setDeviceOpen(false);
            }}
            aria-label="Toggle menu"
            className="md:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-md hover:bg-beige-dark transition-colors duration-200"
          >
            <span
              className={`block w-5 h-[1.5px] bg-black transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-black transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-black transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-beige-dark ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <ul className="flex flex-col list-none px-6 pt-4 pb-2 gap-1">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 !text-gray-500 hover:!text-black text-sm font-medium border-b border-beige-dark transition-colors duration-200"
              >
                {label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 py-3 !text-gray-500 hover:!text-black text-sm font-medium border-b border-beige-dark transition-colors duration-200"
            >
              <Lock size={13} strokeWidth={2} />
              Admin Login
            </a>
          </li>
        </ul>
        <div className="px-6 py-4 flex flex-col gap-2">
          <a
            href="/request/phone"
            className="flex items-center justify-center gap-2 w-full bg-green hover:bg-green-dark !text-black font-semibold text-sm px-5 py-3 rounded-lg transition-colors duration-200"
          >
            <Smartphone size={15} strokeWidth={2} />
            Fix My Phone
          </a>
          <a
            href="/request/laptop"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-beige border border-beige-dark !text-black font-semibold text-sm px-5 py-3 rounded-lg transition-colors duration-200"
          >
            <Laptop size={15} strokeWidth={2} />
            Fix My Laptop
          </a>
        </div>
      </div>
    </nav>
  );
}
