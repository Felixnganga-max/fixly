import { getToken } from "./loginApi";

const BASE_URL = "https://fixly-wcao.vercel.app/fixly/marketplace";
const BRANDS_URL = "https://fixly-wcao.vercel.app/fixly/brands";
const ALERTS_URL = "https://fixly-wcao.vercel.app/fixly/alerts";
const REQUESTS_URL = "https://fixly-wcao.vercel.app/fixly/purchase-requests";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const authHeadersMultipart = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Reads a response as JSON without crashing when the server returns HTML
// (for example a Vercel timeout or 500 page).
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// Returns json.data and keeps json.meta on it as a hidden property (_meta),
// so callers can read what the server did without it leaking into spreads.
function withMeta(json) {
  const data = json.data;
  if (data && typeof data === "object") {
    Object.defineProperty(data, "_meta", { value: json.meta, enumerable: false });
  }
  return data;
}

// Fields that hold objects/arrays and travel inside FormData as JSON text.
const JSON_FIELDS = new Set(["specs", "features", "variants"]);

// Builds the multipart body shared by create and update.
function buildListingForm(payload, imageFiles, extra = {}) {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined) return;

    // null oldPrice must reach the server as empty so a discount can be removed
    if (val === null) {
      if (key === "oldPrice") fd.append(key, "");
      return;
    }

    if (JSON_FIELDS.has(key)) fd.append(key, JSON.stringify(val));
    else fd.append(key, val);
  });

  Object.entries(extra).forEach(([key, val]) => {
    if (val !== undefined && val !== null) fd.append(key, val);
  });

  imageFiles.slice(0, 10).forEach((file) => fd.append("images", file));
  return fd;
}

// ── Public ────────────────────────────────────────────────────

/**
 * Cursor-based listing fetch.
 * Returns { data, hasNext, nextCursor }
 */
export async function getAllListings(params = {}) {
  const query = new URLSearchParams();
  const keys = [
    "all",
    "category",
    "brand",
    "condition",
    "verified",
    "minPrice",
    "maxPrice",
    "search",
    "sortBy",
    "order",
    "limit",
    "cursor",
    "listedBy",
  ];
  keys.forEach((k) => {
    if (params[k] !== undefined && params[k] !== null && params[k] !== "")
      query.set(k, params[k]);
  });

  const res = await fetch(`${BASE_URL}?${query.toString()}`);
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to fetch listings");
  return json; // { data, hasNext, nextCursor }
}

export async function getListingById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Listing not found");
  return json.data;
}

// ── Brands ────────────────────────────────────────────────────

/**
 * Returns ["Apple", "Samsung", ...] for the given category.
 */
export async function getBrandNames(category) {
  const qs = category ? `?category=${category}` : "";
  const res = await fetch(`${BRANDS_URL}${qs}`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  const json = await readJson(res);
  return (json.data || []).map((b) => b.name);
}

// ── Admin / Shop ──────────────────────────────────────────────

export async function getMarketplaceStats() {
  const res = await fetch(`${BASE_URL}/stats`, { headers: authHeaders() });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  return json.data;
}

/**
 * payload may include `variants`: [{ ram, storage, price, oldPrice, inStock }]
 * and `libraryDevice` (id of the library entry the listing was made from).
 */
export async function createListing(payload, imageFiles = []) {
  const fd = buildListingForm(payload, imageFiles);
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeadersMultipart(),
    body: fd,
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to create listing");
  return withMeta(json);
}

/**
 * existingImages: the photo URLs the seller chose to KEEP.
 * Anything on the listing that is not in this list is removed, and newly
 * uploaded files are added after the kept ones. Omit it to keep the old
 * behaviour (new uploads replace all photos, no uploads leaves photos alone).
 */
export async function updateListing(
  id,
  payload,
  imageFiles = [],
  existingImages,
) {
  const extra = {};
  if (Array.isArray(existingImages)) {
    extra.keepImages = JSON.stringify(existingImages);
  }

  const fd = buildListingForm(payload, imageFiles, extra);
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeadersMultipart(),
    body: fd,
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to update listing");
  return withMeta(json);
}

export async function deleteListingImage(id, imageUrl) {
  const res = await fetch(`${BASE_URL}/${id}/image`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ imageUrl }),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to delete image");
  return json.data;
}

export async function toggleListingActive(id) {
  const res = await fetch(`${BASE_URL}/${id}/toggle-active`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to toggle listing");
  return json.data;
}

export async function deleteListing(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to delete listing");
  return json;
}

// ── Price Alerts ──────────────────────────────────────────────

export async function createPriceAlert(listingId, targetPrice) {
  const res = await fetch(`${BASE_URL}/${listingId}/alert`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ targetPrice }),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to create alert");
  return json;
}

export async function deletePriceAlert(listingId) {
  const res = await fetch(`${BASE_URL}/${listingId}/alert`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to delete alert");
  return json;
}

export async function getMyAlerts() {
  const res = await fetch(`${ALERTS_URL}/mine`, { headers: authHeaders() });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to fetch alerts");
  return json;
}

// ── Purchase Requests ─────────────────────────────────────────

/**
 * data: buyer details plus, for listings with versions, the chosen one:
 *   { ..., variant: { ram, storage } }
 * The server must read the price from the listing's own variants,
 * never from what the browser sends.
 */
export async function submitPurchaseRequest(listingId, data) {
  const res = await fetch(`${BASE_URL}/${listingId}/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to submit request");
  return json;
}

export async function getAllPurchaseRequests(params = {}) {
  const query = new URLSearchParams();
  ["status", "listing", "page", "limit", "sortBy", "order"].forEach((k) => {
    if (params[k]) query.set(k, params[k]);
  });
  const res = await fetch(`${REQUESTS_URL}?${query.toString()}`, {
    headers: authHeaders(),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to fetch requests");
  return json;
}

export async function updatePurchaseRequest(id, data) {
  const res = await fetch(`${REQUESTS_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to update request");
  return json.data;
}

export async function deletePurchaseRequest(id) {
  const res = await fetch(`${REQUESTS_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to delete request");
  return json;
}

// ── AI Listing ────────────────────────────────────────────────

/** One device per call (keeps each request under serverless time limits). */
export async function aiGenerateDevice({ category, brand, name }) {
  const res = await fetch(`${BASE_URL}/ai/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ category, brand, name }),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "AI generation failed");
  return json.data;
}

/** Saves reviewed drafts as hidden listings (price 0, no images). */
export async function aiSaveDrafts({ category, brand, items }) {
  const res = await fetch(`${BASE_URL}/ai/drafts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ category, brand, items }),
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(json.message || "Failed to save drafts");
  return json; // { created, skipped }
}