// Dependency-free SVG chart: black bars = page views, green bars = contact/action taps
export default function StatsChart({ series = [], height = 140 }) {
  const W = 600;
  const pad = 4;
  const max = Math.max(1, ...series.map((d) => Math.max(d.views, d.actions)));
  const slot = (W - pad * 2) / Math.max(series.length, 1);
  const bar = Math.max(2, slot * 0.6);
  const y = (v) => height - 18 - (v / max) * (height - 28);

  if (!series.length) return null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label="Views and actions per day">
        <line x1="0" x2={W} y1={height - 18} y2={height - 18} stroke="#E5DFD3" />
        {series.map((d, i) => {
          const x = pad + i * slot + (slot - bar) / 2;
          return (
            <g key={d.date}>
              <rect x={x} y={y(d.views)} width={bar} height={height - 18 - y(d.views)} rx="2" fill="#0D1117" opacity="0.85" />
              {d.actions > 0 && (
                <rect x={x + bar * 0.25} y={y(d.actions)} width={bar * 0.5} height={height - 18 - y(d.actions)} rx="2" fill="#00D084" />
              )}
              <title>{`${d.date} — ${d.views} views, ${d.actions} actions`}</title>
            </g>
          );
        })}
        <text x={pad} y={height - 4} fontSize="10" fill="#9CA3AF">{series[0].date.slice(5)}</text>
        <text x={W - pad} y={height - 4} fontSize="10" fill="#9CA3AF" textAnchor="end">
          {series[series.length - 1].date.slice(5)}
        </text>
      </svg>
      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-black inline-block" /> Page views</span>
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-green inline-block" /> Contact taps</span>
      </div>
    </div>
  );
}