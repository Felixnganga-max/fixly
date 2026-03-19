import TechnicianCard from "./Testimonials";

// Placeholder data — replace with real API data later
const technicians = [
  {
    id: 1,
    name: "James Mwangi",
    category: "phone",
    specializations: ["Screen repair", "Battery replacement", "Water damage"],
    shopAddress: "Moi Avenue, Shop 12, CBD",
    availability: "Available",
  },
  {
    id: 2,
    name: "Faith Njeri",
    category: "laptop",
    specializations: ["OS installs", "SSD upgrades", "Motherboard repair"],
    shopAddress: "Westlands, Ring Rd, Suite 4B",
    availability: "Available",
  },
  {
    id: 3,
    name: "Kevin Odhiambo",
    category: "phone",
    specializations: ["Charging ports", "Speaker repair", "Camera fix"],
    shopAddress: "Ngong Road, Prestige Plaza",
    availability: "Busy",
  },
];

export default function TechnicianSection() {
  return (
    <section
      id="technicians"
      className="w-full px-6 py-24 border-t border-black-border"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-green-subtle border border-green-dark/30 text-green text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide mb-4">
            Our technicians
          </span>
          <h2 className="font-display text-4xl font-extrabold text-white">
            Every tech is verified by us.
          </h2>
          <p className="text-white-muted mt-3 text-base max-w-md mx-auto">
            We vet specializations, not just names. Phone and laptop experts are
            listed separately.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {technicians.map((tech) => (
            <TechnicianCard key={tech.id} technician={tech} />
          ))}
        </div>
      </div>
    </section>
  );
}
