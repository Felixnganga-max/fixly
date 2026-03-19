import { useState } from "react";

const devices = [
  {
    id: "phone",
    label: "Fix My Phone",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    alt: "Smartphone being repaired",
  },
  {
    id: "laptop",
    label: "Fix My Laptop",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
    alt: "Laptop open on a desk",
  },
];

export default function Hero() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="relative w-full overflow-hidden bg-beige px-4 sm:px-6 pt-10 pb-10">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <h1 className="font-display text-center text-[clamp(2.6rem,6vw,4.5rem)] font-extrabold !text-black leading-[1.08] tracking-tight max-w-5xl mx-auto">
          Broken device? <br />
          <span className="text-green relative text-3xl md:text-4xl">
            Get it fixed by verified technicians in minutes!
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 10"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 7 C60 2, 150 2, 298 7"
                stroke="#00C896"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </span>
        </h1>

        {/* Device Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-14 w-full">
          {devices.map(({ id, label, image, alt }) => (
            <a
              key={id}
              href={`/request/${id}`}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              className={`
                group relative flex flex-col overflow-hidden rounded-xl border-2
                w-full cursor-pointer
                transition-all duration-300
                ${
                  hovered === id
                    ? "border-green shadow-[0_8px_40px_-8px_#00C89644] -translate-y-2"
                    : "border-beige-dark shadow-sm"
                }
              `}
            >
              {/* Image */}
              <div className="w-full h-64 sm:h-72 lg:h-80 overflow-hidden bg-beige-dark">
                <img
                  src={image}
                  alt={alt}
                  className={`w-full h-full object-cover transition-transform duration-500 ${hovered === id ? "scale-105" : "scale-100"}`}
                />
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between px-6 py-5 bg-white">
                <span className="font-display font-extrabold text-black text-xl sm:text-2xl tracking-tight">
                  {label}
                </span>
                <span
                  className={`
                  text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300
                  ${
                    hovered === id
                      ? "bg-green text-black"
                      : "bg-beige text-beige-text"
                  }
                `}
                >
                  Start →
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-center text-beige-text text-xs mt-8 tracking-wide">
          No account needed · We reach you via WhatsApp
        </p>
      </div>
    </section>
  );
}
