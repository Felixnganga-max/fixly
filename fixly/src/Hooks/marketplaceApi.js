import { getToken } from "./loginApi";

const BASE_URL = "https://fixly-wcao.vercel.app/fixly/marketplace";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Auth headers WITHOUT Content-Type — let the browser set it for multipart
const authHeadersMultipart = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ── Public ───────────────────────────────────────────────────

/**
 * GET /api/marketplace
 * @param {{ category?, brand?, condition?, verified?, minPrice?, maxPrice?,
 *           search?, sortBy?, order?, page?, limit?, all? }} params
 */
export async function getAllListings(params = {}) {
  const query = new URLSearchParams();
  if (params.all) query.set("all", params.all);
  if (params.category) query.set("category", params.category);
  if (params.brand) query.set("brand", params.brand);
  if (params.condition) query.set("condition", params.condition);
  if (params.verified !== undefined) query.set("verified", params.verified);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.order) query.set("order", params.order);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const res = await fetch(`${BASE_URL}?${query.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch listings");
  return json; // { data, total, count, page, pages }
}

/**
 * GET /api/marketplace/:id
 * Also increments views on the backend
 */
export async function getListingById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Listing not found");
  return json.data;
}

// ── Admin ─────────────────────────────────────────────────────

/**
 * GET /api/marketplace/stats
 */
export async function getMarketplaceStats() {
  const res = await fetch(`${BASE_URL}/stats`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  return json.data;
}

/**
 * POST /api/marketplace
 * Sends multipart/form-data so Cloudinary images can be uploaded (up to 10).
 *
 * @param {{ category, brand, name, price, condition, shortDescription,
 *           oldPrice?, features?, specs?, verified?, listedBy? }} payload
 * @param {File[]} imageFiles  — array of File objects from an <input type="file">
 */
export async function createListing(payload, imageFiles = []) {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    // Serialize objects/arrays so Express can parse them back via JSON.parse
    if (key === "specs" || key === "features") {
      fd.append(key, JSON.stringify(val));
    } else {
      fd.append(key, val);
    }
  });

  // Attach images — field name must match upload.array("images", 10)
  imageFiles.slice(0, 10).forEach((file) => fd.append("images", file));

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeadersMultipart(), // no Content-Type — browser sets boundary
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create listing");
  return json.data;
}

/**
 * PUT /api/marketplace/:id
 * Pass imageFiles to replace ALL existing images, or omit to leave images unchanged.
 *
 * @param {string} id
 * @param {object} payload
 * @param {File[]} imageFiles
 */
export async function updateListing(id, payload, imageFiles = []) {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (key === "specs" || key === "features") {
      fd.append(key, JSON.stringify(val));
    } else {
      fd.append(key, val);
    }
  });

  imageFiles.slice(0, 10).forEach((file) => fd.append("images", file));

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeadersMultipart(),
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update listing");
  return json.data;
}

/**
 * DELETE /api/marketplace/:id/image
 * Remove a single image from a listing (also deletes from Cloudinary).
 *
 * @param {string} id        — listing ID
 * @param {string} imageUrl  — the full Cloudinary URL to remove
 */
export async function deleteListingImage(id, imageUrl) {
  const res = await fetch(`${BASE_URL}/${id}/image`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ imageUrl }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete image");
  return json.data;
}

/**
 * PATCH /api/marketplace/:id/toggle-active
 * Publish or hide a listing
 */
export async function toggleListingActive(id) {
  const res = await fetch(`${BASE_URL}/${id}/toggle-active`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle listing");
  return json.data;
}

/**
 * DELETE /api/marketplace/:id
 * Also purges all Cloudinary images for this listing.
 */
export async function deleteListing(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete listing");
  return json;
}

// ── Purchase Requests (public + admin) ───────────────────────

/**
 * POST /api/marketplace/:id/buy
 * Submit a "Buy Now" interest request for a listing.
 *
 * @param {string} listingId
 * @param {{ firstName, email, phone, address, deliveryMethod? }} data
 */
export async function submitPurchaseRequest(listingId, data) {
  const res = await fetch(`${BASE_URL}/${listingId}/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to submit request");
  return json;
}

/**
 * GET /api/purchase-requests
 * Admin — list all purchase requests.
 *
 * @param {{ status?, listing?, page?, limit?, sortBy?, order? }} params
 */
export async function getAllPurchaseRequests(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.listing) query.set("listing", params.listing);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.order) query.set("order", params.order);

  const REQUESTS_URL = BASE_URL.replace("/marketplace", "/purchase-requests");
  const res = await fetch(`${REQUESTS_URL}?${query.toString()}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch requests");
  return json; // { data, total, count, page, pages }
}

/**
 * PATCH /api/purchase-requests/:id
 * Admin — update status or add notes.
 *
 * @param {string} id
 * @param {{ status?, notes? }} data
 */
export async function updatePurchaseRequest(id, data) {
  const REQUESTS_URL = BASE_URL.replace("/marketplace", "/purchase-requests");
  const res = await fetch(`${REQUESTS_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update request");
  return json.data;
}

/**
 * DELETE /api/purchase-requests/:id
 * Admin — delete a purchase request.
 */
export async function deletePurchaseRequest(id) {
  const REQUESTS_URL = BASE_URL.replace("/marketplace", "/purchase-requests");
  const res = await fetch(`${REQUESTS_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete request");
  return json;
}
