import { getToken } from "./loginApi";
import { getCustomerToken } from "./customerApi";

const TRACK_URL = "https://fixly-wcao.vercel.app/fixly/analytics/track";

// Anonymous per-browser id (counts unique visitors; not personal data)
function visitorId() {
  let id = localStorage.getItem("fixly_vid");
  if (!id) {
    id = crypto.randomUUID?.() || `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem("fixly_vid", id);
  }
  return id;
}

// Where this visit came from (google.com, direct, ...) - captured once per session
function sessionSource() {
  let r = sessionStorage.getItem("fixly_ref");
  if (r === null) {
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : "";
      r = host && host !== window.location.hostname ? host : "direct";
    } catch {
      r = "direct";
    }
    sessionStorage.setItem("fixly_ref", r);
  }
  return r;
}

/**
 * track({ type, shop?, listingId? })
 * type: page_view | product_view | whatsapp_click | call_click
 * shop: shop _id or slug.  listingId: lets the server find the shop for product views.
 * Fire-and-forget. Admin / shop-owner sessions are not counted.
 */
export function track({ type, shop, listingId }) {
  try {
    if (getToken()) return;
    const body = JSON.stringify({
      type,
      shop,
      listingId,
      visitorId: visitorId(),
      referrer: sessionSource(),
      customerToken: getCustomerToken() || undefined,
    });
    // text/plain keeps this a "simple" request: no CORS preflight to fail silently.
    // keepalive lets it finish even when the click leaves the page (tel: / wa.me).
    fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never break the page */
  }
}