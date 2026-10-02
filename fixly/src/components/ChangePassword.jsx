import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { changePassword, logout } from "../Hooks/loginApi";

const inputCls =
  "w-full bg-beige border border-beige-dark rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-green transition-colors placeholder:text-gray-400";

/**
 * Used twice:
 *  - /shop/change-password  (forced on first login, full-page)
 *  - /shop/settings         (inside the shop layout)
 */
export default function ChangePassword() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const forced = pathname === "/shop/change-password";

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErr("");
    setDone(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 8) return setErr("New password must be at least 8 characters");
    if (form.next !== form.confirm) return setErr("Passwords do not match");

    setLoading(true);
    try {
      await changePassword(form.current, form.next);
      setForm({ current: "", next: "", confirm: "" });
      if (forced) navigate("/shop", { replace: true });
      else setDone(true);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const card = (
    <form
      onSubmit={submit}
      className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5 w-full max-w-md"
    >
      <div>
        <h3 className="font-display font-extrabold text-lg" style={{ color: "#0D1117" }}>
          {forced ? "Set your password" : "Change password"}
        </h3>
        {forced && (
          <p className="text-gray-400 text-sm mt-1">
            You signed in with a temporary password. Choose your own to continue.
          </p>
        )}
      </div>

      {[
        ["current", forced ? "Temporary password" : "Current password", "current-password"],
        ["next", "New password", "new-password"],
        ["confirm", "Confirm new password", "new-password"],
      ].map(([key, label, auto]) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-gray-500 text-xs font-medium">{label}</label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={form[key]}
              onChange={set(key)}
              autoComplete={auto}
              className={inputCls}
            />
          </div>
        </div>
      ))}

      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm font-medium">{err}</p>
        </div>
      )}
      {done && (
        <div className="flex items-center gap-2 bg-green-light border border-green-dark/30 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 size={15} /> Password updated
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !form.current || !form.next}
        className="flex items-center justify-center gap-2 bg-green hover:bg-green-dark text-black font-bold text-sm py-3.5 rounded-xl disabled:opacity-60 transition-colors"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {forced ? "Save and continue" : "Update password"}
      </button>

      {forced && (
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="text-xs text-gray-400 hover:text-black"
        >
          Sign out
        </button>
      )}
    </form>
  );

  if (!forced) return card;

  return <div className="min-h-screen bg-beige flex items-center justify-center px-6 py-16">{card}</div>;
}