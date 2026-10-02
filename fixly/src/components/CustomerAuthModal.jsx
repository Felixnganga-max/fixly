import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Loader2 } from "lucide-react";
import { registerCustomer, loginCustomer } from "../Hooks/customerApi";

const input =
  "w-full bg-white border border-stone-200 focus:border-stone-900 outline-none rounded-xl px-3.5 py-3 text-sm text-stone-900";

export default function CustomerAuthModal({ open, onClose, onSuccess, reason }) {
  const [mode, setMode] = useState("register");
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    marketingConsent: false,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = (k) => (e) =>
    setF((p) => ({
      ...p,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const register = mode === "register";

  const submit = async () => {
    setErr("");
    if (!f.email.trim() || !f.password) return setErr("Enter your email and password");
    if (register && (!f.name.trim() || !f.phone.trim()))
      return setErr("Name and phone number are required");
    setBusy(true);
    try {
      if (register) await registerCustomer(f);
      else await loginCustomer(f.email, f.password);
      onSuccess?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onEnter = (e) => e.key === "Enter" && submit();

  return (
    <div
      className="fixed inset-0 z-[70] bg-stone-950/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-stone-50 rounded-2xl shadow-xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"
        >
          <X size={18} />
        </button>

        <h2 className="font-bold text-xl text-stone-900">
          {register ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-stone-500 mt-1 leading-relaxed">
          {reason ||
            (register
              ? "Free and quick. Save your details to contact sellers and get offers."
              : "Log in to contact sellers.")}
        </p>

        <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1 mt-5">
          {[
            ["register", "Create account"],
            ["login", "Log in"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setMode(id);
                setErr("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === id ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3" onKeyDown={onEnter}>
          {register && (
            <>
              <input className={input} placeholder="Full name" value={f.name} onChange={set("name")} autoComplete="name" />
              <input className={input} placeholder="Phone (e.g. 0712 345 678)" inputMode="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
            </>
          )}
          <input className={input} placeholder="Email" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
          <input
            className={input}
            placeholder={register ? "Password (8+ characters)" : "Password"}
            type="password"
            value={f.password}
            onChange={set("password")}
            autoComplete={register ? "new-password" : "current-password"}
          />

          {register && (
            <label className="flex items-start gap-2.5 text-xs text-stone-500 leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={f.marketingConsent}
                onChange={set("marketingConsent")}
                className="mt-0.5 accent-stone-900"
              />
              <span>
                Send me offers and promos from Fixly by SMS, WhatsApp or email (optional). I can
                opt out at any time.
              </span>
            </label>
          )}

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-emerald-500 hover:text-stone-900 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {register ? "Create account" : "Log in"}
          </button>
        </div>

        <p className="text-xs text-stone-400 mt-5 text-center">
          Shop owner or admin?{" "}
          <Link to="/login" onClick={onClose} className="text-stone-700 font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}