import { getToken } from "./loginApi";

const BASE_URL = "http://localhost:5000/fixly/technicians";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/**
 * GET /api/technicians
 * Admin: pass all=true to see unverified too
 */
export async function getAllTechnicians(params = {}) {
  const query = new URLSearchParams();
  query.set("all", "true"); // admin view — see everyone
  if (params.category) query.set("category", params.category);
  if (params.availability) query.set("availability", params.availability);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const res = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch technicians");
  return json; // { data, total, count }
}

/**
 * GET /api/technicians/:id
 */
export async function getTechnicianById(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Technician not found");
  return json.data;
}

/**
 * POST /api/technicians
 */
export async function createTechnician(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create technician");
  return json.data;
}

/**
 * PUT /api/technicians/:id
 */
export async function updateTechnician(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update technician");
  return json.data;
}

/**
 * PATCH /api/technicians/:id/availability
 * @param {"Available"|"Busy"|"Offline"} availability
 */
export async function updateAvailability(id, availability) {
  const res = await fetch(`${BASE_URL}/${id}/availability`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ availability }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update availability");
  return json.data;
}

/**
 * DELETE /api/technicians/:id
 */
export async function deleteTechnician(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete technician");
  return json;
}
