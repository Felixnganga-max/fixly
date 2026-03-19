export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendLabel,
}) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0 || trend === undefined;

  return (
    <div className="bg-white border border-beige-dark rounded-2xl px-6 py-5 flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
            <Icon size={17} className="text-gray-500" strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className="font-display font-extrabold text-3xl text-black leading-none"
          style={{ color: "#0D1117" }}
        >
          {value}
        </p>
        {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
      </div>

      {/* Trend */}
      {!isNeutral && (
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold ${isPositive ? "text-green" : "text-red-500"}`}
        >
          <span>{isPositive ? "↑" : "↓"}</span>
          <span>
            {Math.abs(trend)}% {trendLabel ?? "this week"}
          </span>
        </div>
      )}
    </div>
  );
}
