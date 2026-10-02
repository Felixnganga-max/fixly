import { getToken } from "./loginApi";

const BASE = "https://fixly-wcao.vercel.app/fixly/analytics";

/** Error with the HTTP status, so screens can react (401 = log in again, 404 = no such route). */
export class AnalyticsError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "AnalyticsError";
    this.status = status;
  }
}

/**
 * GET helper. Builds the query string safely (empty values are dropped),
 * stops early when nobody is logged in, and supports an AbortSignal so a
 * screen can cancel a request when the date range changes or it unmounts.
 * (An aborted request throws an AbortError: ignore it in your catch.)
 */
async function get(path, params = {}, { signal } = {}) {
  const token = getToken();
  if (!token) throw new AnalyticsError("Please log in again", 401);

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });
  const url = `${BASE}${path}${qs.toString() ? `?${qs}` : ""}`;

  let res;
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new AnalyticsError("Network error. Check your connection and try again.");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback =
      res.status === 401 || res.status === 403
        ? "You don't have access to this. Log in again."
        : res.status === 404
          ? "This report isn't available on the server yet."
          : "Failed to load analytics";
    throw new AnalyticsError(json.message || fallback, res.status);
  }
  return json.data;
}

// ── Admin ─────────────────────────────────────────────────────

/** { days, since, shops: [{ shopId, shopName, slug, active, pageViews, uniqueVisitors, productViews, whatsappClicks, callClicks, contactReveals, leads }] } */
export const getAnalyticsSummary = (days = 30, opts) => get("/summary", { days }, opts);

/** Recent events for one shop: [{ _id, type, createdAt, referrer, customer?, listing? }] */
export const getShopEvents = (shopId, { days = 30, type = "", limit = 100, signal } = {}) =>
  get(`/shops/${shopId}/events`, { days, type, limit }, { signal });

// ── Shop owner (their own shop only) ──────────────────────────

/** { days, pageViews, visitors, listingViews, contactRate, callTaps, whatsappTaps, directionsTaps, allActions } */
export const getMyPerformance = (days = 7, opts) => get("/me", { days }, opts);

// Same endpoint, kept under the name your other screens already import
export const getMyAnalytics = (days = 30, opts) => get("/me", { days }, opts);

// ── Not served by the backend yet ─────────────────────────────
// These still call routes that don't exist, so they fail with a clear
// "isn't available" message instead of breaking silently. Remove them (and
// the screens that use them) or ask for the routes to be built.

/** @deprecated no `/shops/:id` route */
export const getShopAnalytics = (shopId, days = 30, opts) => get(`/shops/${shopId}`, { days }, opts);

/** @deprecated no `/overview` route (the admin Analytics page uses getAnalyticsSummary) */
export const getAnalyticsOverview = (days = 30, opts) => get("/overview", { days }, opts);

/** @deprecated no `/me/summary` route (use getMyPerformance) */
export const getMyAnalyticsSummary = (days = 30, opts) => get("/me/summary", { days }, opts);

/** @deprecated no `/me/events` route */
export const getMyShopEvents = ({ days = 30, type = "", limit = 100, signal } = {}) =>
  get("/me/events", { days, type, limit }, { signal });