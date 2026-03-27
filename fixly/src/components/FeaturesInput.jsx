import { Plus, X, CheckCircle2 } from "lucide-react";

/**
 * FeaturesInput
 * Props:
 *   features  {string[]}
 *   onChange  (features: string[]) => void
 */
export default function FeaturesInput({ features = [""], onChange }) {
  const set = (i, val) => {
    const next = [...features];
    next[i] = val;
    onChange(next);
  };

  const add = () => onChange([...features, ""]);

  const remove = (i) => onChange(features.filter((_, idx) => idx !== i));

  const handleKey = (e, i) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (features[i].trim()) add();
    }
    if (e.key === "Backspace" && !features[i] && features.length > 1) {
      e.preventDefault();
      remove(i);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {features.map((feat, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <CheckCircle2
            size={15}
            className={`flex-shrink-0 transition-colors duration-200 ${feat.trim() ? "text-green" : "text-gray-200"}`}
            strokeWidth={2}
          />
          <input
            type="text"
            value={feat}
            placeholder={`Feature ${i + 1} — e.g. 5G connectivity`}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => handleKey(e, i)}
            className="flex-1 bg-beige border border-beige-dark hover:border-gray-300 focus:border-green rounded-xl px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300"
            style={{ color: "#0D1117" }}
          />
          {features.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-2 text-sm text-green hover:text-green font-semibold transition-colors w-fit mt-1 px-1"
      >
        <div className="w-6 h-6 rounded-lg bg-green/10 flex items-center justify-center">
          <Plus size={13} strokeWidth={2.5} className="text-green" />
        </div>
        Add feature
        <span className="text-gray-300 font-normal text-xs">↵ Enter</span>
      </button>
    </div>
  );
}
