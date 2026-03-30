const BASE_URL = "https://fixly-wcao.vercel.app/fixly";

/**
 * Get the auth token from localStorage
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Shared authenticated fetch helper
 */
async function authFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

// ─────────────────────────────────────────────
//  PUBLIC — used by BuyNowModal
// ─────────────────────────────────────────────

/**
 * Submit a purchase / buy-now request for a marketplace listing.
 * @param {string} listingId
 * @param {{ firstName, email, phone, address, deliveryMethod }} payload
 */
export async function submitPurchaseRequest(listingId, payload) {
  return authFetch(`${BASE_URL}/marketplace/${listingId}/buy`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─────────────────────────────────────────────
//  ADMIN — used by PurchaseAdmin
// ─────────────────────────────────────────────

/**
 * Get all purchase requests (paginated, filterable)
 * @param {{ status?, listing?, page?, limit?, sortBy?, order? }} params
 */
export async function getAllPurchaseRequests(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  ).toString();
  return authFetch(`${BASE_URL}/purchase-requests${qs ? `?${qs}` : ""}`);
}

/**
 * Get a single purchase request by ID
 * @param {string} id
 */
export async function getPurchaseRequestById(id) {
  return authFetch(`${BASE_URL}/purchase-requests/${id}`);
}

/**
 * Update status and/or notes on a purchase request
 * @param {string} id
 * @param {{ status?, notes? }} payload
 */
export async function updatePurchaseRequest(id, payload) {
  return authFetch(`${BASE_URL}/purchase-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Assign a shop owner to a purchase request.
 * Status auto-advances: "pending" → "contacted" on the backend.
 * @param {string} id      - purchase request _id
 * @param {string} shopId  - ShopOwner _id
 */
export async function assignShopToPurchaseRequest(id, shopId) {
  return authFetch(`${BASE_URL}/purchase-requests/${id}/assign-shop`, {
    method: "PATCH",
    body: JSON.stringify({ shopId }),
  });
}

/**
 * Remove the assigned shop from a purchase request.
 * @param {string} id - purchase request _id
 */
export async function unassignShopFromPurchaseRequest(id) {
  return authFetch(`${BASE_URL}/purchase-requests/${id}/unassign-shop`, {
    method: "PATCH",
  });
}

/**
 * Delete a purchase request
 * @param {string} id
 */
export async function deletePurchaseRequest(id) {
  return authFetch(`${BASE_URL}/purchase-requests/${id}`, {
    method: "DELETE",
  });
}
