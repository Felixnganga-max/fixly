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

// ─────────────────────────────────────────────────────────────
//  REPAIR REQUESTS
// ─────────────────────────────────────────────────────────────

/**
 * Aggregate counts per status + device type breakdown.
 * Endpoint: GET /fixly/repair-requests/stats
 * Returns: { total, pending, assigned, inProgress, completed, issueReported, phones, laptops }
 */
export async function getRepairStats() {
  const res = await authFetch(`${BASE}/repair-requests/stats`);
  return res.data;
}

/**
 * Recent repair jobs for the dashboard table.
 * Endpoint: GET /fixly/repair-requests?page=1&limit=8&sortBy=createdAt&order=desc
 * @param {number} limit  How many rows to fetch (default 8)
 */
export async function getRecentRepairJobs(limit = 8) {
  const res = await authFetch(
    `${BASE}/repair-requests?page=1&limit=${limit}&sortBy=createdAt&order=desc`,
  );
  return res.data; // array of repair request objects
}

// ─────────────────────────────────────────────────────────────
//  COMMISSIONS
// ─────────────────────────────────────────────────────────────

/**
 * Commission totals (earned, pending, tier info).
 * Endpoint: GET /fixly/commissions/stats
 * Returns: { totalEarned, totalPending, count, tiers }
 */
export async function getCommissionStats() {
  const res = await authFetch(`${BASE}/commissions/stats`);
  return res.data;
}

/**
 * List of commission records (for a breakdown table if needed).
 * Endpoint: GET /fixly/commissions?page=1&limit=50
 */
export async function getCommissions({ page = 1, limit = 50, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);
  const res = await authFetch(`${BASE}/commissions?${params}`);
  return res; // { data, total, count }
}

// ─────────────────────────────────────────────────────────────
//  TECHNICIANS
// ─────────────────────────────────────────────────────────────

/**
 * All technicians (used for "Active Techs" count).
 * Endpoint: GET /fixly/technicians   (public, returns verified only)
 * Pass all=true to get everyone (admin).
 * @param {boolean} all  Include unverified technicians
 */
export async function getTechnicians({ all = false } = {}) {
  const url = `${BASE}/technicians${all ? "?all=true" : ""}`;
  const res = await authFetch(url);
  return res; // { data, total, count }
}

// ─────────────────────────────────────────────────────────────
//  MARKETPLACE
// ─────────────────────────────────────────────────────────────

/**
 * Marketplace listing stats (total, active, phones, laptops, etc.).
 * Endpoint: GET /fixly/marketplace/stats
 */
export async function getMarketplaceStats() {
  const res = await authFetch(`${BASE}/marketplace/stats`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────
//  PURCHASE REQUESTS
// ─────────────────────────────────────────────────────────────

/**
 * Recent purchase requests filtered by status.
 * Endpoint: GET /fixly/purchase-requests?status=pending&limit=5
 */
export async function getPendingPurchases(limit = 5) {
  const res = await authFetch(
    `${BASE}/purchase-requests?status=pending&page=1&limit=${limit}&sortBy=createdAt&order=desc`,
  );
  return res; // { data, total }
}

/**
 * Purchase request counts broken down by all four statuses + total.
 * Fires four requests in parallel (no dedicated stats endpoint exists).
 * Returns: { total, pending, contacted, completed, cancelled, recentRequests }
 */
export async function getPurchaseStats() {
  const [all, pending, contacted, completed, cancelled] =
    await Promise.allSettled([
      authFetch(`${BASE}/purchase-requests?page=1&limit=1`),
      authFetch(
        `${BASE}/purchase-requests?status=pending&page=1&limit=5&sortBy=createdAt&order=desc`,
      ),
      authFetch(`${BASE}/purchase-requests?status=contacted&page=1&limit=1`),
      authFetch(`${BASE}/purchase-requests?status=completed&page=1&limit=1`),
      authFetch(`${BASE}/purchase-requests?status=cancelled&page=1&limit=1`),
    ]);

  const val = (r, fallback) => (r.status === "fulfilled" ? r.value : fallback);

  return {
    total: val(all, { total: 0 }).total,
    pending: val(pending, { total: 0 }).total,
    contacted: val(contacted, { total: 0 }).total,
    completed: val(completed, { total: 0 }).total,
    cancelled: val(cancelled, { total: 0 }).total,
    // The 5 most recent pending requests (for name list)
    recentPending: val(pending, { data: [] }).data,
  };
}

// ─────────────────────────────────────────────────────────────
//  COMBINED — single call that fetches everything the Dashboard needs
// ─────────────────────────────────────────────────────────────

/**
 * Fetches all dashboard data in parallel.
 * Returns: { repairStats, commissionStats, recentJobs, techCount, marketplaceStats, purchaseStats }
 *
 * Usage in Dashboard:
 *   const dash = await fetchDashboardData();
 */
export async function fetchDashboardData() {
  const [
    repairStats,
    commissionStats,
    recentJobs,
    technicians,
    marketplaceStats,
    purchaseStats,
  ] = await Promise.allSettled([
    getRepairStats(),
    getCommissionStats(),
    getRecentRepairJobs(8),
    getTechnicians({ all: true }),
    getMarketplaceStats(),
    getPurchaseStats(),
  ]);

  const settled = (r, fallback) =>
    r.status === "fulfilled" ? r.value : fallback;

  return {
    repairStats: settled(repairStats, {
      total: 0,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      issueReported: 0,
      phones: 0,
      laptops: 0,
    }),
    commissionStats: settled(commissionStats, {
      totalEarned: 0,
      totalPending: 0,
      count: 0,
    }),
    recentJobs: settled(recentJobs, []),
    techCount: settled(technicians, { total: 0 }).total,
    marketplaceStats: settled(marketplaceStats, {
      total: 0,
      active: 0,
      verified: 0,
      phones: 0,
      laptops: 0,
      byCondition: { new: 0, used: 0, refurbished: 0 },
    }),
    purchaseStats: settled(purchaseStats, {
      total: 0,
      pending: 0,
      contacted: 0,
      completed: 0,
      cancelled: 0,
      recentPending: [],
    }),
  };
}
