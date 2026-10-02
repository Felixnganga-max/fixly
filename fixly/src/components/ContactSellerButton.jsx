import { useState, useEffect } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { getPublicShopContact } from "../Hooks/shopPublicApi";
import { track } from "../Hooks/analytics";

// 07xx / +254... -> 2547xx... for wa.me
const toIntl = (p = "") => {
  const d = String(p).replace(/\D/g, "");
  return d.startsWith("254") ? d : d.startsWith("0") ? `254${d.slice(1)}` : d;
};

/**
 * Seller's WhatsApp + Call buttons, number visible, no login needed.
 * Every click is recorded for the admin analytics.
 * `shop` needs a slug or _id (and phone/whatsapp if you already have them;
 * otherwise they are fetched). `listingId` = product being viewed (optional).
 */
export default function ContactSellerButton({ shop, listingId, dark = false }) {
  const key = shop?.slug || shop?._id || shop?.id;
  const shopRef = shop?._id || shop?.id || key;

  const direct = shop?.phone
    ? { shopName: shop.shopName, phone: shop.phone, whatsapp: shop.whatsapp || shop.phone }
    : null;

  const [fetched, setFetched] = useState(null);
  useEffect(() => {
    setFetched(null);
    if (direct || !key) return;
    let off = false;
    getPublicShopContact(key)
      .then((c) => !off && setFetched(c))
      .catch(() => {});
    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, direct?.phone]);

  const contact = direct || fetched;
  if (!key || !contact?.phone) return null;

  const wa = toIntl(contact.whatsapp || contact.phone);

  return (
    <div className="flex gap-2 w-full">
      <a
        href={`https://wa.me/${wa}?text=${encodeURIComponent(
          `Hi ${contact.shopName || ""}, I found you on Fixly.`.replace("Hi ,", "Hi,"),
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
        className={`flex-1 inline-flex items-center justify-center gap-2 border font-semibold text-sm px-4 py-3 rounded-xl whitespace-nowrap transition-colors ${
          dark
            ? "border-stone-700 hover:border-stone-500 text-white"
            : "border-stone-200 hover:border-stone-400 text-stone-700"
        }`}
      >
        <Phone size={15} strokeWidth={2} /> <span className="font-mono">{contact.phone}</span>
      </a>
    </div>
  );
}