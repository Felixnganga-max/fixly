import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { RangePicker, ShopDetail } from "./ShopActivity";
import { getMyAnalyticsSummary, getMyShopEvents } from "../Hooks/analyticsApi";

/** Shop owner's own page performance (their shop only — enforced server-side) */
export default function MyShopStats() {
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getMyAnalyticsSummary(days)
      .then(setMetrics)
      .catch((e) => setError(e.message));
  }, [days]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
          <BarChart3 size={14} className="text-white" strokeWidth={2} />
        </div>
        <h2 className="font-display font-extrabold text-base" style={{ color: "#0D1117" }}>Your page performance</h2>
        <div className="flex-1 h-px bg-beige-dark ml-2" />
        <RangePicker days={days} onChange={setDays} />
      </div>

      {error ? (
        <p className="text-sm text-gray-400">Stats are unavailable right now. ({error})</p>
      ) : (
        <ShopDetail
          metrics={metrics}
          days={days}
          shopKey="mine"
          loadEvents={(d, limit) => getMyShopEvents({ days: d, limit })}
        />
      )}
    </div>
  );
}