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

function StarRating({ count = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5 fill-warning text-warning"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ name, location, device, quote, rating }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="
      flex-shrink-0
      w-[85vw] sm:w-[420px] md:w-auto
      bg-white border border-beige-dark rounded-2xl p-8
      flex flex-col justify-between gap-6
      snap-start
    "
    >
      {/* Top: stars + quote */}
      <div className="flex flex-col gap-4">
        <StarRating count={rating} />
        <p className="text-black text-[1.05rem] leading-relaxed font-body">
          "{quote}"
        </p>
      </div>

      {/* Bottom: author + device tag */}
      <div className="flex items-center justify-between pt-5 border-t border-beige-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-beige border border-beige-dark flex items-center justify-center font-display font-bold text-black text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-black font-semibold text-sm leading-tight">
              {name}
            </p>
            <p className="text-beige-text text-xs mt-0.5">{location}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-beige border border-beige-dark text-beige-text">
          {device}
        </span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="w-full bg-beige py-28 overflow-hidden"
    >
      {/* Header — padded */}
      <div className="max-w-6xl mx-auto px-6 mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="font-display text-5xl font-extrabold !text-green tracking-tight leading-[1.05]">
              Nairobians trust Fixly.
            </h2>
          </div>
          <p className="text-beige-text text-base max-w-xs leading-relaxed md:text-right">
            Real customers. Real repairs.
            <br />
            No fake reviews.
          </p>
        </div>
      </div>

      {/* Scroll track — full bleed on mobile, 2-col grid on desktop */}

      {/* Mobile: horizontal scroll */}
      <div
        className="
        md:hidden
        flex gap-4 overflow-x-auto
        px-6 pb-4
        snap-x snap-mandatory
        scrollbar-hide
        [-webkit-overflow-scrolling:touch]
      "
      >
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} {...t} />
        ))}
      </div>

      {/* Desktop: 2-column grid */}
      <div className="hidden md:grid grid-cols-2 gap-5 max-w-6xl mx-auto px-6">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} {...t} />
        ))}
      </div>
    </section>
  );
}
