import { getToken } from "./loginApi";

const BASE_URL = "https://fixly-wcao.vercel.app/fixly/shop-owners";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Admin ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/shop-owners
 * Get all shop owners with optional filters
 * @param {{ category?, verified?, active?, search?, page?, limit? }} params
 */
export async function getAllShopOwners(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.verified !== undefined && params.verified !== "")
    query.set("verified", params.verified);
  if (params.active !== undefined && params.active !== "")
    query.set("active", params.active);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const res = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch shop owners");
  return json; // { success, count, total, data }
}

/**
 * GET /api/shop-owners/:id
 * Get single shop owner + linked technicians
 * @param {string} id
 */
export async function getShopOwnerById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Shop not found");
  return json.data; // { ...shop, technicians[] }
}

/**
 * POST /api/shop-owners
 * Register a new shop owner
 * @param {{ ownerName, shopName, phone, email?, location, category, description?, verified?, notes? }} payload
 */
export async function createShopOwner(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create shop owner");
  return json.data;
}

/**
 * PUT /api/shop-owners/:id
 * Update shop owner details
 * @param {string} id
 * @param {Partial<ShopOwner>} payload
 */
export async function updateShopOwner(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update shop owner");
  return json.data;
}

/**
 * PATCH /api/shop-owners/:id/verify
 * Toggle verified status
 * @param {string} id
 */
export async function toggleVerified(id) {
  const res = await fetch(`${BASE_URL}/${id}/verify`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle verified");
  return json.data;
}

/**
 * PATCH /api/shop-owners/:id/active
 * Toggle active status
 * @param {string} id
 */
export async function toggleActive(id) {
  const res = await fetch(`${BASE_URL}/${id}/active`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle active");
  return json.data;
}

/**
 * DELETE /api/shop-owners/:id
 * Delete a shop owner
 * @param {string} id
 */
export async function deleteShopOwner(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete shop owner");
  return json;
}
