import { useState } from "react";
import { CheckCircle2, Bell, Shield, Globe, MessageCircle } from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    platformName: "Fixly",
    whatsappNumber: "254700000000",
    notifyTech: true,
    notifyCustomer: true,
    requireVerified: true,
    allowSelfAssign: false,
    commissionModel: "flat",
    defaultCity: "Nairobi",
  });

  const set = (key) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSettings((s) => ({ ...s, [key]: val }));
  };

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Platform info */}
      <SettingsCard
        title="Platform"
        icon={Globe}
        desc="General platform configuration"
      >
        <Field label="Platform Name">
          <input
            type="text"
            value={settings.platformName}
            onChange={set("platformName")}
            className={inputCls}
          />
        </Field>
        <Field label="Default City">
          <input
            type="text"
            value={settings.defaultCity}
            onChange={set("defaultCity")}
            className={inputCls}
          />
        </Field>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard
        title="Notifications"
        icon={Bell}
        desc="Control WhatsApp notification triggers"
      >
        <Field label="WhatsApp Business Number">
          <input
            type="tel"
            value={settings.whatsappNumber}
            onChange={set("whatsappNumber")}
            className={inputCls}
            placeholder="e.g. 254712345678"
          />
        </Field>
        <Toggle
          label="Notify technician on job assignment"
          checked={settings.notifyTech}
          onChange={set("notifyTech")}
        />
        <Toggle
          label="Notify customer when technician is assigned"
          checked={settings.notifyCustomer}
          onChange={set("notifyCustomer")}
        />
      </SettingsCard>

      {/* Job rules */}
      <SettingsCard
        title="Job Rules"
        icon={Shield}
        desc="Controls and constraints for job assignment"
      >
        <Toggle
          label="Only assign verified technicians"
          checked={settings.requireVerified}
          onChange={set("requireVerified")}
        />
        <Toggle
          label="Allow technicians to self-assign"
          checked={settings.allowSelfAssign}
          onChange={set("allowSelfAssign")}
        />
      </SettingsCard>

      {/* Commission model */}
      <SettingsCard
        title="Commission Model"
        icon={MessageCircle}
        desc="How platform commission is calculated"
      >
        <Field label="Commission Structure">
          <select
            value={settings.commissionModel}
            onChange={set("commissionModel")}
            className={inputCls}
          >
            <option value="flat">Flat tier (current)</option>
            <option value="percentage">Percentage-based (future)</option>
          </select>
        </Field>
        <p className="text-gray-400 text-xs leading-relaxed">
          Flat tier commissions are configured on the Commissions page.
          Percentage model will be available in a future update.
        </p>
      </SettingsCard>

      {/* Save */}
      <button
        onClick={handleSave}
        className="flex items-center justify-center gap-2 bg-green hover:bg-green-dark text-black font-bold text-sm py-3.5 rounded-xl transition-colors duration-200"
      >
        {saved ? (
          <>
            <CheckCircle2 size={16} /> Saved!
          </>
        ) : (
          "Save Settings"
        )}
      </button>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SettingsCard({ title, icon: Icon, desc, children }) {
  return (
    <div className="bg-white border border-beige-dark rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-beige-dark">
        <div className="w-8 h-8 rounded-lg bg-beige border border-beige-dark flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-gray-500" strokeWidth={1.75} />
        </div>
        <div>
          <h3
            className="font-display font-bold text-black text-sm"
            style={{ color: "#0D1117" }}
          >
            {title}
          </h3>
          <p className="text-gray-400 text-xs">{desc}</p>
        </div>
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-500 text-xs font-medium">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-600 leading-snug">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange({ target: { type: "checkbox", checked: !checked } })
        }
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-green" : "bg-beige-dark"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

const inputCls =
  "bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-green transition-colors duration-200 w-full";
