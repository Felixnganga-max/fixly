import { useEffect } from "react";
import { getRole } from "./loginApi";

const EVENT_URL = "https://fixly-wcao.vercel.app/fixly/analytics/event";
const STAFF = ["admin", "superadmin", "shop_owner"];

let memorySid = null;
function sessionId() {
  if (memorySid) return memorySid;
  try {
    let id = localStorage.getItem("fx_sid");
    if (!id) {
      id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("fx_sid", id);
    }
    memorySid = id;
  } catch {
    memorySid = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return memorySid;
}

/**
 * Fire-and-forget. Never throws, never blocks a click.
 * types: shop_view | listing_view | call_click | whatsapp_click | email_click
 *        | directions_click | share_click | social_click
 */
export function track(type, { shopId, listingId } = {}) {
  if (!shopId) return;
  if (STAFF.includes(getRole())) return; // don't count admins / shop owners browsing
  try {
    fetch(EVENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true, // survives tel: / wa.me navigation
      body: JSON.stringify({
        type,
        shopId,
        listingId: listingId || undefined,
        sessionId: sessionId(),
        referrer: document.referrer ? new URL(document.referrer).hostname : "",
      }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Once per tab session per target (guards React StrictMode double-effects and re-renders). */
export function trackOnce(type, ids = {}) {
  const key = `fx:${type}:${ids.shopId}:${ids.listingId || ""}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* storage blocked — fall through */
  }
  track(type, ids);
}

/** useTrackView("shop_view", { shopId })  /  useTrackView("listing_view", { shopId, listingId }) */
export function useTrackView(type, { shopId, listingId } = {}) {
  useEffect(() => {
    if (shopId) trackOnce(type, { shopId, listingId });
  }, [type, shopId, listingId]);
}