import { useState, useEffect } from "react";
import {
  BarChart3,
  Eye,
  Users,
  Tag,
  MousePointerClick,
  PhoneCall,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { getMyPerformance } from "../Hooks/analyticsApi";

// Matches the dashboard theme (font-display, beige borders)
const DISPLAY = "font-display font-extrabold";

const RANGES = [7, 30, 90];

const fmt = (n) => Number(n || 0).toLocaleString();

// "Your page performance" for the shop owner dashboard. Drop it into ShopOverview.
export default function ShopPerformance() {
  const [days, setDays] = useState(7);
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    setError("");
    getMyPerformance(days)
      .then((x) => !off && setD(x))
      .catch((e) => !off && setError(e.message));
    return () => {
      off = true;
    };
  }, [days]);

  const cards = [
    { label: "Page views", icon: Eye, value: fmt(d?.pageViews) },
    { label: "Visitors", icon: Users, value: fmt(d?.visitors) },
    { label: "Listing views", icon: Tag, value: fmt(d?.listingViews) },
    { label: "Contact rate", icon: MousePointerClick, value: d?.contactRate ?? 0, suffix: "% of visitors" },
    { label: "Call taps", icon: PhoneCall, value: fmt(d?.callTaps) },
    { label: "WhatsApp taps", icon: MessageCircle, value: fmt(d?.whatsappTaps) },
    { label: "Directions taps", icon: MapPin, value: fmt(d?.directionsTaps) },
    { label: "All actions", icon: MousePointerClick, value: fmt(d?.allActions) },
  ];

  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
          <BarChart3 size={16} strokeWidth={2} />
        </span>
        <h2 className={`${DISPLAY} text-xl text-black whitespace-nowrap`}>Your page performance</h2>
        <span className="flex-1 h-px bg-beige-dark" />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setDays(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
              days === r
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-beige-dark hover:border-gray-400"
            }`}
          >
            {r}d
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {cards.map(({ label, icon: Icon, value, suffix }) => (
          <div key={label} className="bg-white border border-beige-dark rounded-3xl px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-gray-400">
              <Icon size={15} strokeWidth={1.8} /> {label}
            </p>
            <p className={`${DISPLAY} text-3xl text-black mt-3 flex items-baseline gap-2`}>
              {d || error ? value : "…"}
              {suffix && <span className="text-xs font-medium text-gray-400">{suffix}</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}