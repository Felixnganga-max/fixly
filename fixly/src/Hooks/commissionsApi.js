const BASE = "http://localhost:5000/fixly";

function getToken() {
  return localStorage.getItem("token");
}

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

/**
 * Get all commissions — filterable by status, type, technician
 * @param {{ status?, type?, technician?, page?, limit? }} params
 */
export async function getAllCommissions(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  ).toString();
  return authFetch(`${BASE}/commissions${qs ? `?${qs}` : ""}`);
}

/**
 * Get commission stats (totals split by repair / sale)
 */
export async function getCommissionStats() {
  return authFetch(`${BASE}/commissions/stats`);
}

/**
 * Mark a commission as paid
 * @param {string} id
 */
export async function markCommissionPaid(id) {
  return authFetch(`${BASE}/commissions/${id}/pay`, { method: "PATCH" });
}

/**
 * Manually create a commission (admin override)
 * @param {{ type, jobId?, technicianId?, purchaseId?, listingId?, basePrice }} payload
 */
export async function createCommission(payload) {
  return authFetch(`${BASE}/commissions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a commission record
 * @param {string} id
 */
export async function deleteCommission(id) {
  return authFetch(`${BASE}/commissions/${id}`, { method: "DELETE" });
}
