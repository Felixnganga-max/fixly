import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Smartphone, Laptop, ArrowLeft, Loader2 } from "lucide-react";

const deviceConfig = {
  phone: {
    icon: Smartphone,
    label: "Phone Repair",
    issues: [
      "Cracked / broken screen",
      "Battery not charging",
      "Water damage",
      "Charging port issue",
      "Speaker / microphone",
      "Camera not working",
      "Phone not turning on",
      "Other",
    ],
  },
  laptop: {
    icon: Laptop,
    label: "Laptop Repair",
    issues: [
      "Won't turn on",
      "Slow / overheating",
      "Broken screen",
      "Keyboard not working",
      "OS install / reinstall",
      "Virus / malware removal",
      "SSD / HDD upgrade",
      "Other",
    ],
  },
};

export default function Request() {
  const { device } = useParams();
  const navigate = useNavigate();
  const config = deviceConfig[device];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    issue: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!config) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-500 text-lg">Invalid device type.</p>
        <button
          onClick={() => navigate("/")}
          className="text-green text-sm hover:underline"
        >
          ← Go back home
        </button>
      </div>
    );
  }

  const DeviceIcon = config.icon;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.issue) e.issue = "Please select an issue";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1200));
    setLoading(false);
    navigate("/confirmation", { state: { form, device } });
  };

  return (
    <div className="min-h-screen bg-beige px-6 py-16">
      <div className="max-w-xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-black text-sm mb-10 transition-colors duration-200"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-beige-dark flex items-center justify-center">
              <DeviceIcon size={20} className="text-green" strokeWidth={1.75} />
            </div>
            <h1
              className="font-display text-3xl font-extrabold text-black tracking-tight"
              style={{ color: "#0D1117" }}
            >
              {config.label}
            </h1>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Fill in your details and we'll assign you a verified specialist —
            usually within minutes.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-6">
          {/* Name */}
          <Field label="Your Name" error={errors.name}>
            <input
              type="text"
              placeholder="e.g. Amina Wanjiku"
              value={form.name}
              onChange={set("name")}
              className={inputClass(errors.name)}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone / WhatsApp Number" error={errors.phone}>
            <input
              type="tel"
              placeholder="e.g. 0712 345 678"
              value={form.phone}
              onChange={set("phone")}
              className={inputClass(errors.phone)}
            />
          </Field>

          {/* Location */}
          <Field label="Your Location" error={errors.location}>
            <input
              type="text"
              placeholder="e.g. Westlands, Nairobi"
              value={form.location}
              onChange={set("location")}
              className={inputClass(errors.location)}
            />
          </Field>

          {/* Issue selector */}
          <Field label="What's the issue?" error={errors.issue}>
            <div className="grid grid-cols-2 gap-2">
              {config.issues.map((issue) => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, issue }));
                    setErrors((e) => ({ ...e, issue: "" }));
                  }}
                  className={`
                    text-left text-sm px-4 py-3 rounded-lg border transition-all duration-150
                    ${
                      form.issue === issue
                        ? "bg-green-light border-green text-green font-semibold"
                        : "bg-white border-beige-dark text-gray-500 hover:border-gray-400 hover:text-black"
                    }
                  `}
                >
                  {issue}
                </button>
              ))}
            </div>
          </Field>

          {/* Additional description */}
          <Field label="Anything else we should know? (optional)">
            <textarea
              placeholder="e.g. The screen cracked after it dropped, touch still works but display is damaged..."
              value={form.description}
              onChange={set("description")}
              rows={4}
              className={`${inputClass(false)} resize-none`}
            />
          </Field>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green hover:bg-green-dark disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-base px-6 py-4 rounded-xl transition-colors duration-200 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request →"
            )}
          </button>

          <p className="text-gray-400 text-xs text-center">
            We'll reach out via WhatsApp within minutes. No account needed.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-600 text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full bg-white border rounded-lg px-4 py-3 text-black text-sm placeholder:text-gray-400 outline-none transition-colors duration-200 focus:border-green ${
    hasError ? "border-error" : "border-beige-dark hover:border-gray-400"
  }`;
}
