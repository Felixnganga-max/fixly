import { Smartphone, Laptop } from "lucide-react";

const CONDITIONS = ["New", "Used", "Refurbished"];
const PHONE_BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Tecno",
  "Infinix",
  "Other",
];
const LAPTOP_BRANDS = [
  "HP",
  "Lenovo",
  "Dell",
  "Asus",
  "Apple",
  "MSI",
  "Acer",
  "Other",
];

const inputCls = (err) =>
  `w-full bg-beige border rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-gray-300
  ${
    err
      ? "border-red-300 focus:border-red-400 bg-red-50/30"
      : "border-beige-dark hover:border-gray-300 focus:border-green"
  }`;

function Label({ children, required }) {
  return (
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
      {children}
      {required && <span className="text-red-400 text-[10px]">*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  return msg ? <p className="text-red-400 text-xs mt-0.5">{msg}</p> : null;
}

/**
 * CoreInfoForm
 * Props:
 *   form     {object}
 *   errors   {object}
 *   onChange (field, value) => void
 */
export default function CoreInfoForm({ form, errors, onChange }) {
  const brands = form.category === "phone" ? PHONE_BRANDS : LAPTOP_BRANDS;

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Category */}
      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        <div className="flex gap-3">
          {[
            { val: "phone", Icon: Smartphone, label: "Phone" },
            { val: "laptop", Icon: Laptop, label: "Laptop" },
          ].map(({ val, Icon, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange("category", val)}
              className={`
                flex items-center gap-2.5 px-6 py-3 rounded-xl border text-sm font-semibold
                transition-all duration-200 flex-1 justify-center
                ${
                  form.category === val
                    ? "bg-black text-white border-black shadow-md"
                    : "bg-beige border-beige-dark text-gray-500 hover:border-gray-300 hover:bg-white"
                }
              `}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand + Name — 2 col */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label required>Brand</Label>
          <select
            value={form.brand}
            onChange={(e) => onChange("brand", e.target.value)}
            className={inputCls(errors.brand)}
            style={{ color: form.brand ? "#0D1117" : "#9CA3AF" }}
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <FieldError msg={errors.brand} />
        </div>

        <div className="flex flex-col gap-2">
          <Label required>Device Name</Label>
          <input
            type="text"
            placeholder="e.g. iPhone 15 Pro Max"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={inputCls(errors.name)}
            style={{ color: "#0D1117" }}
          />
          <FieldError msg={errors.name} />
        </div>
      </div>

      {/* Price + Old Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label required>Selling Price (KES)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">
              KES
            </span>
            <input
              type="number"
              placeholder="0"
              value={form.price}
              onChange={(e) => onChange("price", e.target.value)}
              className={`${inputCls(errors.price)} pl-14`}
              style={{ color: "#0D1117" }}
            />
          </div>
          <FieldError msg={errors.price} />
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Original Price (KES){" "}
            <span className="text-gray-300 font-normal normal-case tracking-normal">
              — optional
            </span>
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">
              KES
            </span>
            <input
              type="number"
              placeholder="Leave blank if no discount"
              value={form.oldPrice}
              onChange={(e) => onChange("oldPrice", e.target.value)}
              className={`${inputCls(false)} pl-14`}
              style={{ color: "#0D1117" }}
            />
          </div>
          {form.oldPrice && Number(form.oldPrice) > Number(form.price) && (
            <p className="text-green text-xs font-semibold">
              {Math.round(((form.oldPrice - form.price) / form.oldPrice) * 100)}
              % discount will show
            </p>
          )}
        </div>
      </div>

      {/* Condition + Rating + Reviews */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Condition</Label>
          <select
            value={form.condition}
            onChange={(e) => onChange("condition", e.target.value)}
            className={inputCls(false)}
            style={{ color: "#0D1117" }}
          >
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Rating (0–5)</Label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="0.0"
            value={form.rating}
            onChange={(e) => onChange("rating", e.target.value)}
            className={inputCls(false)}
            style={{ color: "#0D1117" }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Review Count</Label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={form.reviews}
            onChange={(e) => onChange("reviews", e.target.value)}
            className={inputCls(false)}
            style={{ color: "#0D1117" }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Label required>Short Description</Label>
        <textarea
          rows={3}
          placeholder="Brief marketing description shown on the product page and cards..."
          value={form.shortDescription}
          onChange={(e) => onChange("shortDescription", e.target.value)}
          className={`${inputCls(errors.shortDescription)} resize-none leading-relaxed`}
          style={{ color: "#0D1117" }}
        />
        <div className="flex items-center justify-between">
          <FieldError msg={errors.shortDescription} />
          <span
            className={`text-xs ml-auto ${form.shortDescription.length > 250 ? "text-amber-400" : "text-gray-300"}`}
          >
            {form.shortDescription.length}/300
          </span>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            key: "verified",
            label: "Verified by Fixly",
            sub: "Shows the verified shield badge on listing",
          },
          {
            key: "active",
            label: "Live on site",
            sub: "Immediately visible to customers",
          },
        ].map(({ key, label, sub }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key, !form[key])}
            className={`
              flex items-center justify-between px-4 py-3.5 rounded-xl border
              text-left transition-all duration-200
              ${
                form[key]
                  ? "bg-green/8 border-green/30 shadow-sm"
                  : "bg-beige border-beige-dark hover:border-gray-300"
              }
            `}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "#0D1117" }}>
                {label}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
            </div>
            <div
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ml-3 ${form[key] ? "bg-green" : "bg-gray-200"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${form[key] ? "translate-x-6" : "translate-x-1"}`}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
