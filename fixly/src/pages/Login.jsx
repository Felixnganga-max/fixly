import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [authErr, setAuthErr] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
    setAuthErr("");
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password.trim()) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    setAuthErr("");

    try {
      // Replace with real API call:
      // const res = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: form.email, password: form.password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || "Invalid credentials");
      // localStorage.setItem("token", data.token);
      // navigate("/admin");

      await new Promise((r) => setTimeout(r, 1200));
      navigate("/admin");
    } catch (err) {
      setAuthErr(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err) =>
    `w-full bg-beige border rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200 ${
      err ? "border-error" : "border-beige-dark hover:border-gray-400"
    }`;

  return (
    <div className="min-h-screen bg-beige flex">
      {/* ── Left — image panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1000&auto=format&fit=crop&q=80"
          alt="Technician repairing a device"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content over image */}
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          {/* Logo */}
          <a
            href="/"
            className="font-display text-2xl font-extrabold text-white tracking-tight w-fit"
          >
            Fix<span className="text-green">ly</span>
          </a>

          {/* Quote */}
          <div>
            <p className="font-display font-bold text-white text-3xl leading-snug mb-4">
              "The right repair,
              <br />
              done right — every time."
            </p>
            <p className="text-white/60 text-sm">
              Nairobi's trusted repair and device platform.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right — login form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Mobile logo */}
          <a
            href="/"
            className="font-display text-2xl font-extrabold text-black tracking-tight w-fit lg:hidden"
            style={{ color: "#0D1117" }}
          >
            Fix<span className="text-green">ly</span>
          </a>

          {/* Header */}
          <div>
            <h1
              className="font-display font-extrabold text-3xl text-black leading-tight"
              style={{ color: "#0D1117" }}
            >
              Welcome back.
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Sign in to access the Fixly admin panel.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            {/* Auth error */}
            {authErr && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-error text-sm font-medium">{authErr}</p>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  strokeWidth={1.75}
                />
                <input
                  type="email"
                  placeholder="e.g. admin@fixly.co.ke"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                  className={`${inputCls(errors.email)} pl-11`}
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  strokeWidth={1.75}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="current-password"
                  className={`${inputCls(errors.password)} pl-11 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? (
                    <EyeOff size={15} strokeWidth={1.75} />
                  ) : (
                    <Eye size={15} strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-error text-xs">{errors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <a
                href="mailto:info@fixly.co.ke?subject=Password Reset Request"
                className="text-xs text-gray-400 hover:text-green transition-colors duration-200"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green hover:bg-green-dark disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-sm py-4 rounded-xl transition-colors duration-200 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-gray-400 text-xs text-center">
            This portal is for Fixly admins only.{" "}
            <a
              href="/"
              className="text-green hover:text-green-dark transition-colors font-medium"
            >
              Back to site →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
