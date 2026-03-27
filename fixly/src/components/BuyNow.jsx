import { useState } from "react";
import {
  X,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Truck,
  Store,
  HelpCircle,
} from "lucide-react";
import { submitPurchaseRequest } from "../Hooks/marketplaceApi";

const deliveryOptions = [
  {
    value: "delivery",
    label: "Deliver to me",
    icon: Truck,
    desc: "We arrange delivery to your address",
  },
  {
    value: "pickup",
    label: "I'll pick up",
    icon: Store,
    desc: "We'll share directions to the stock location",
  },
  {
    value: "undecided",
    label: "Not sure yet",
    icon: HelpCircle,
    desc: "We'll discuss logistics when we contact you",
  },
];

export default function BuyNowModal({ product, onClose }) {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phone: "",
    address: "",
    deliveryMethod: "undecided",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone))
      e.phone = "Enter a valid phone number";
    if (!form.address.trim()) e.address = "Address is required";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError("");
    try {
      await submitPurchaseRequest(product._id, form);
      setSuccess(true);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2
              className="font-display font-extrabold text-lg text-black"
              style={{ color: "#0D1117" }}
            >
              {success ? "Request Submitted!" : "Express Your Interest"}
            </h2>
            {!success && (
              <p className="text-gray-400 text-xs mt-0.5">
                Fill in your details — we'll get back to you shortly
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={16} strokeWidth={2.5} className="text-gray-500" />
          </button>
        </div>

        {/* Product snippet */}
        {!success && (
          <div className="flex items-center gap-3 mx-6 mt-5 p-3 rounded-xl border border-beige-dark bg-beige">
            <img
              src={product.images?.[0] || ""}
              alt={product.name}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-beige-dark"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80";
              }}
            />
            <div className="min-w-0">
              <p className="text-gray-400 text-xs uppercase tracking-wide">
                {product.brand}
              </p>
              <p
                className="font-semibold text-black text-sm truncate"
                style={{ color: "#0D1117" }}
              >
                {product.name}
              </p>
              <p
                className="font-mono font-extrabold text-black text-sm"
                style={{ color: "#0D1117" }}
              >
                KES {product.price.toLocaleString()}
              </p>
            </div>
            {product.verified && (
              <div className="ml-auto flex-shrink-0">
                <ShieldCheck
                  size={18}
                  className="text-green-600"
                  strokeWidth={2}
                />
              </div>
            )}
          </div>
        )}

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2
                size={32}
                className="text-green-600"
                strokeWidth={2}
              />
            </div>
            <div>
              <h3
                className="font-display font-bold text-xl text-black mb-2"
                style={{ color: "#0D1117" }}
              >
                We've received your request!
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Thanks,{" "}
                <span
                  className="font-semibold text-black"
                  style={{ color: "#0D1117" }}
                >
                  {form.firstName}
                </span>
                ! Our team will contact you on{" "}
                <span className="font-semibold">{form.phone}</span> or{" "}
                <span className="font-semibold">{form.email}</span> to arrange{" "}
                {form.deliveryMethod === "delivery"
                  ? "delivery to your address"
                  : form.deliveryMethod === "pickup"
                    ? "a pickup from our location"
                    : "next steps"}
                .
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* First Name */}
            <Field
              icon={User}
              label="First Name"
              placeholder="e.g. Amara"
              value={form.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
            />

            {/* Email */}
            <Field
              icon={Mail}
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
            />

            {/* Phone */}
            <Field
              icon={Phone}
              label="Phone Number"
              type="tel"
              placeholder="+254 7XX XXX XXX"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
            />

            {/* Address */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={12} className="text-gray-400" />
                Delivery / Contact Address
              </label>
              <textarea
                rows={2}
                placeholder="Street, area, city — e.g. Westlands, Nairobi"
                value={form.address}
                onChange={set("address")}
                className={`w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                  errors.address
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-200"
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs">{errors.address}</p>
              )}
            </div>

            {/* Delivery method */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                How do you prefer to get it?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {deliveryOptions.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() =>
                      setForm((f) => ({ ...f, deliveryMethod: value }))
                    }
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all duration-200 ${
                      form.deliveryMethod === value
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400 text-gray-500"
                    }`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={2}
                      className={
                        form.deliveryMethod === value
                          ? "text-white"
                          : "text-gray-400"
                      }
                    />
                    <span className="text-xs font-semibold leading-tight">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-gray-400 text-xs">
                {
                  deliveryOptions.find((o) => o.value === form.deliveryMethod)
                    ?.desc
                }
              </p>
            </div>

            {serverError && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {serverError}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-black hover:bg-green-700 text-white font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Request"
              )}
            </button>

            <p className="text-gray-400 text-xs text-center">
              By submitting, you agree to be contacted by our team. We never
              share your details with third parties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable field ────────────────────────────────────────────────────────────
function Field({ icon: Icon, label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
        <Icon size={12} className="text-gray-400" />
        {label}
      </label>
      <input
        {...inputProps}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all ${
          error ? "border-red-400 focus:ring-red-400" : "border-gray-200"
        }`}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
