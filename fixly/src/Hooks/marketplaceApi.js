import { getToken } from "./loginApi";

const BASE_URL = "https://fixly-wcao.vercel.app/fixly/marketplace";
const BRANDS_URL = "https://fixly-wcao.vercel.app/fixly/brands";
const ALERTS_URL = "https://fixly-wcao.vercel.app/fixly/alerts";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const authHeadersMultipart = () => ({
  Authorization: `Bearer ${getToken()}`,
});

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
  ];
  keys.forEach((k) => {
    if (params[k] !== undefined && params[k] !== null && params[k] !== "")
      query.set(k, params[k]);
  });

  const res = await fetch(`${BASE_URL}?${query.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch listings");
  return json; // { data, hasNext, nextCursor }
}

export async function getListingById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  const json = await res.json();
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
  const json = await res.json();
  return json.data.map((b) => b.name);
}

// ── Admin ─────────────────────────────────────────────────────

export async function getMarketplaceStats() {
  const res = await fetch(`${BASE_URL}/stats`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  return json.data;
}

export async function createListing(payload, imageFiles = []) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (key === "specs" || key === "features")
      fd.append(key, JSON.stringify(val));
    else fd.append(key, val);
  });
  imageFiles.slice(0, 10).forEach((file) => fd.append("images", file));
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeadersMultipart(),
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create listing");
  return json.data;
}

export async function updateListing(id, payload, imageFiles = []) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (key === "specs" || key === "features")
      fd.append(key, JSON.stringify(val));
    else fd.append(key, val);
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

export async function toggleListingActive(id) {
  const res = await fetch(`${BASE_URL}/${id}/toggle-active`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle listing");
  return json.data;
}

export async function deleteListing(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
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
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create alert");
  return json;
}

export async function deletePriceAlert(listingId) {
  const res = await fetch(`${BASE_URL}/${listingId}/alert`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete alert");
  return json;
}

export async function getMyAlerts() {
  const res = await fetch(`${ALERTS_URL}/mine`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch alerts");
  return json;
}

// ── Purchase Requests ─────────────────────────────────────────

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

export async function getAllPurchaseRequests(params = {}) {
  const query = new URLSearchParams();
  ["status", "listing", "page", "limit", "sortBy", "order"].forEach((k) => {
    if (params[k]) query.set(k, params[k]);
  });
  const REQUESTS_URL = BASE_URL.replace("/marketplace", "/purchase-requests");
  const res = await fetch(`${REQUESTS_URL}?${query.toString()}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch requests");
  return json;
}

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
