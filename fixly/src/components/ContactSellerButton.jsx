import { useState } from "react";
import { MessageCircle, Phone, Loader2, Lock } from "lucide-react";
import CustomerAuthModal from "./CustomerAuthModal";
import { getCustomerToken, getShopContact } from "../Hooks/customerApi";
import { track } from "../Hooks/analytics";

// 07xx / +254… -> 2547xx… for wa.me
const toIntl = (p = "") => {
  const d = String(p).replace(/\D/g, "");
  return d.startsWith("254") ? d : d.startsWith("0") ? `254${d.slice(1)}` : d;
};

/**
 * "Get seller's number" -> sign-up/login -> number, WhatsApp and Call buttons.
 * Every WhatsApp / Call click is recorded for the admin analytics.
 * `shop` needs a slug or _id. `listingId` (optional) = product the visitor was viewing.
 */
export default function ContactSellerButton({ shop, listingId, dark = false }) {
  const key = shop?.slug || shop?._id || shop?.id;
  const shopRef = shop?._id || shop?.id || key;
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  if (!key) return null;

  const reveal = async () => {
    setLoading(true);
    setErr("");
    try {
      setContact(await getShopContact(key));
    } catch (e) {
      if (e.status === 401) setAuthOpen(true);
      else setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const click = () => (getCustomerToken() ? reveal() : setAuthOpen(true));

  const modal = (
    <CustomerAuthModal
      open={authOpen}
      onClose={() => setAuthOpen(false)}
      onSuccess={() => {
        setAuthOpen(false);
        reveal();
      }}
      reason="Create a free account to see this seller's phone number and WhatsApp."
    />
  );

  if (contact) {
    const wa = toIntl(contact.whatsapp || contact.phone);
    return (
      <div className="w-full">
        <p className={`text-xs mb-2 ${dark ? "text-stone-400" : "text-stone-500"}`}>
          <span className="font-mono">{contact.phone}</span>
        </p>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(
              `Hi ${contact.shopName}, I found you on Fixly.`,
            )}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => track({ type: "whatsapp_click", shop: shopRef, listingId })}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-stone-900 font-semibold text-sm px-4 py-3 rounded-xl transition-colors"
          >
            <MessageCircle size={15} strokeWidth={2} /> WhatsApp
          </a>
          <a
            href={`tel:${contact.phone}`}
            onClick={() => track({ type: "call_click", shop: shopRef, listingId })}
            className={`flex-1 inline-flex items-center justify-center gap-2 border font-semibold text-sm px-4 py-3 rounded-xl transition-colors ${
              dark
                ? "border-stone-700 hover:border-stone-500 text-white"
                : "border-stone-200 hover:border-stone-400 text-stone-700"
            }`}
          >
            <Phone size={15} strokeWidth={2} /> Call
          </a>
        </div>
        {modal}
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={click}
        disabled={loading}
        className={`w-full inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-60 ${
          dark
            ? "bg-emerald-500 hover:bg-emerald-400 text-stone-900"
            : "border border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900"
        }`}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} strokeWidth={2} />}
        Get seller's number
      </button>
      {err && <p className="text-xs text-red-500 mt-2">{err}</p>}
      {modal}
    </div>
  );
}