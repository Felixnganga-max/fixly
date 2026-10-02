const BASE_URL = "https://fixly-wcao.vercel.app/fixly/public/shops";

/**
 * GET /fixly/public/shops/:slug  (no auth)
 * Returns { shop, listings }
 */
export async function getShopBySlug(slug) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(slug)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || "Shop not found");
    err.status = res.status;
    throw err;
  }
  return json.data;
}

/**
 * GET /fixly/public/shops?offers=sell|repair&category=phone|laptop
 * Returns an array of shops (no phone numbers).
 */
export async function listPublicShops(params = {}) {
  const q = new URLSearchParams();
  if (params.offers) q.set("offers", params.offers);
  if (params.category) q.set("category", params.category);
  const res = await fetch(`${BASE_URL}?${q.toString()}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Could not load shops");
  return json.data;
}

/** GET /fixly/public/shops/:key/contact -> { shopName, phone, whatsapp } (no login needed) */
export async function getPublicShopContact(key) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(key)}/contact`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Contact not available");
  return json.data;
}