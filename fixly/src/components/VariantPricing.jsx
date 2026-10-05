import { Plus, X } from "lucide-react";

const input =
  "w-full bg-beige border border-beige-dark rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green transition-colors";

const label = (v) => [v.ram, v.storage].filter(Boolean).join(" / ");
const same = (a, b) =>
  String(a.ram || "").trim().toLowerCase() === String(b.ram || "").trim().toLowerCase() &&
  String(a.storage || "").trim().toLowerCase() === String(b.storage || "").trim().toLowerCase();

/**
 * Lets a seller pick the RAM / storage versions they sell and set a price for each.
 *
 * Props
 *  variants     [{ ram, storage, price, oldPrice, inStock }]   what the seller has chosen
 *  suggestions  [{ ram, storage }]                              the library's versions for this device
 *  onChange     (variants) => void
 */
export default function VariantPricing({ variants = [], suggestions = [], onChange }) {
  const open = suggestions.filter((s) => !variants.some((v) => same(v, s)));

  const add = (v = {}) =>
    onChange([
      ...variants,
      { ram: v.ram || "", storage: v.storage || "", price: "", oldPrice: "", inStock: true },
    ]);
  const update = (i, patch) => onChange(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i) => onChange(variants.filter((_, idx) => idx !== i));

  const priced = variants.filter((v) => Number(v.price) > 0);
  const lowest = priced.length ? Math.min(...priced.map((v) => Number(v.price))) : null;

  return (
    <div className="border border-beige-dark rounded-2xl p-5 bg-white">
      <div className="mb-4">
        <h3 className="font-display font-bold text-base" style={{ color: "#0D1117" }}>
          Versions and prices
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Different RAM and storage cost different amounts. Add each version you sell and give it its own
          price. Leave this empty to sell one version at the single price above.
        </p>
      </div>

      {/* Versions from the library, one tap to add */}
      {open.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Versions of this phone
          </p>
          <div className="flex flex-wrap gap-2">
            {open.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => add(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-beige-dark text-xs font-semibold text-gray-600 hover:bg-black hover:text-white hover:border-black transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} />
                {label(s) || "Version"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chosen versions */}
      {variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="hidden md:grid grid-cols-[1fr_1fr_1.2fr_1.2fr_auto_auto] gap-3 px-1">
            {["RAM", "Storage", "Price (KES)", "Old price (optional)", "In stock", ""].map((h) => (
              <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {h}
              </p>
            ))}
          </div>

          {variants.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1.2fr_1.2fr_auto_auto] gap-3 items-center"
            >
              <input
                className={input}
                placeholder="RAM e.g. 8GB"
                value={v.ram}
                onChange={(e) => update(i, { ram: e.target.value })}
              />
              <input
                className={input}
                placeholder="Storage e.g. 256GB"
                value={v.storage}
                onChange={(e) => update(i, { storage: e.target.value })}
              />
              <input
                className={input}
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Price"
                value={v.price}
                onChange={(e) => update(i, { price: e.target.value })}
              />
              <input
                className={input}
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="Old price"
                value={v.oldPrice}
                onChange={(e) => update(i, { oldPrice: e.target.value })}
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={v.inStock !== false}
                  onChange={(e) => update(i, { inStock: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="md:hidden">In stock</span>
              </label>
              <button
                type="button"
                onClick={() => remove(i)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Remove version"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => add()}
          className="flex items-center gap-2 text-sm font-semibold text-green hover:underline"
        >
          <Plus size={15} strokeWidth={2} /> Add another version
        </button>
        {lowest && (
          <p className="text-xs text-gray-400">
            Listed as <span className="font-semibold text-black">from KES {lowest.toLocaleString()}</span>
          </p>
        )}
      </div>
    </div>
  );
}