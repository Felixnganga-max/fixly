import { getToken } from "./loginApi"; // reuse your existing token helper

const BASE_URL = "http://localhost:5000/fixly/repair-requests";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Public ──────────────────────────────────────────────────

/**
 * POST /api/repair-requests
 * Submit a new repair request (customer facing, no auth)
 */
export async function submitRepairRequest(formData) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      deviceType: formData.deviceType,
      deviceModel: formData.deviceModel || "",
      issueType: formData.issue || "",
      issueDescription: formData.description || "",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to submit request");
  return json.data;
}

/**
 * GET /api/repair-requests/:id
 * Get single request by ID (public — for confirmation page)
 */
export async function getRequestById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request not found");
  return json.data;
}

// ── Admin ────────────────────────────────────────────────────

/**
 * GET /api/repair-requests
 * Get all requests with optional filters
 * @param {{ status?, deviceType?, search?, page?, limit?, sortBy?, order? }} params
 */
export async function getAllRequests(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.deviceType) query.set("deviceType", params.deviceType);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.order) query.set("order", params.order);

  const res = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch requests");
  return json; // { data, total, count, page, pages }
}

/**
 * GET /api/repair-requests/stats
 * Dashboard overview stats
 */
export async function getRequestStats() {
  const res = await fetch(`${BASE_URL}/stats`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  return json.data; // { total, pending, assigned, inProgress, completed, ... }
}

/**
 * PATCH /api/repair-requests/:id/assign
 * Assign a technician + optional shop and quote
 * @param {string} id
 * @param {{ technicianId, shopId?, estimatedPriceMin?, estimatedPriceMax?, estimatedTime?, adminNotes? }} payload
 */
export async function assignRequest(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}/assign`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to assign request");
  return json.data;
}

/**
 * PATCH /api/repair-requests/:id/status
 * Update request status
 * @param {string} id
 * @param {"Pending"|"Assigned"|"InProgress"|"Completed"|"IssueReported"} status
 * @param {string} [adminNotes]
 */
export async function updateRequestStatus(id, status, adminNotes = "") {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status, adminNotes }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update status");
  return json.data;
}

/**
 * DELETE /api/repair-requests/:id
 * Delete a request (admin only)
 */
export async function deleteRequest(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete request");
  return json;
}
