import { BarChart3 } from "lucide-react";
import ShopStatsPanel from "./ShopStatsPanel";

/** Shop owner's own page performance (their shop only, enforced server-side) */
export default function MyShopStats() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
          <BarChart3 size={14} className="text-white" strokeWidth={2} />
        </div>
        <h2 className="font-display font-extrabold text-base" style={{ color: "#0D1117" }}>
          Your page performance
        </h2>
        <div className="flex-1 h-px bg-beige-dark ml-2" />
      </div>

      <ShopStatsPanel mine defaultDays={7} hideHeader />
    </div>
  );
}