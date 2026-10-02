import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { getMyShop, updateMyShop } from "../Hooks/shopApi";

const inputCls =
  "w-full bg-beige border border-beige-dark rounded-xl px-4 py-3 text-sm outline-none focus:border-green transition-colors placeholder:text-gray-400";

export default function ShopProfile() {
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({ phone: "", whatsapp: "", location: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "ok" | "err", text }

  useEffect(() => {
    getMyShop()
      .then((s) => {
        setShop(s);
        setForm({
          phone: s.phone || "",
          whatsapp: s.whatsapp || "",
          location: s.location || "",
          description: s.description || "",
        });
      })
      .catch((e) => setMsg({ type: "err", text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setMsg(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.phone.trim() || !form.location.trim()) {
      setMsg({ type: "err", text: "Phone and location are required" });
      return;
    }
    setSaving(true);
    try {
      setShop(await updateMyShop(form));
      setMsg({ type: "ok", text: "Saved" });
    } catch (err) {
      setMsg({ type: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }
  if (!shop) return null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Locked fields */}
      <div className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-3">
        <h3 className="font-display font-bold text-sm" style={{ color: "#0D1117" }}>
          Shop details
        </h3>
        <Row label="Shop name" value={shop.shopName} />
        <Row label="Owner" value={shop.ownerName} />
        <Row label="Email" value={shop.email} />
        <Row label="Page URL" value={shop.slug ? `/s/${shop.slug}` : "—"} />
        <Row label="Devices" value={(shop.category || []).join(", ")} />
        <Row label="Offers" value={(shop.offers || []).join(", ")} />
        <p className="text-xs text-gray-400 pt-2 border-t border-beige-dark">
          To change these, contact Fixly.
        </p>
      </div>

      {/* Editable */}
      <form onSubmit={save} className="bg-white border border-beige-dark rounded-2xl p-6 flex flex-col gap-5">
        <h3 className="font-display font-bold text-sm" style={{ color: "#0D1117" }}>
          Contact and about
        </h3>

        <Field label="Phone">
          <input value={form.phone} onChange={set("phone")} className={inputCls} placeholder="07XX XXX XXX" />
        </Field>
        <Field label="WhatsApp">
          <input value={form.whatsapp} onChange={set("whatsapp")} className={inputCls} placeholder="07XX XXX XXX" />
        </Field>
        <Field label="Location">
          <input value={form.location} onChange={set("location")} className={inputCls} placeholder="e.g. Moi Avenue, CBD" />
        </Field>
        <Field label="About your shop">
          <textarea
            rows={5}
            value={form.description}
            onChange={set("description")}
            className={`${inputCls} resize-y`}
            placeholder="What you sell or repair, how long you've been trading, warranty, opening hours…"
          />
        </Field>

        {msg && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
              msg.type === "ok"
                ? "bg-green-light border-green-dark/30 text-black"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {msg.type === "ok" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {msg.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white font-semibold text-sm px-6 py-3 rounded-xl disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium truncate" style={{ color: "#0D1117" }}>
        {value || "—"}
      </span>
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