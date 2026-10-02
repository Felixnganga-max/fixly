import { getToken } from "./loginApi";

const BASE = "https://fixly-wcao.vercel.app/fixly/analytics";
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

async function get(path, fallback) {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || fallback);
  return json.data;
}

/** Admin: every shop. { days, totals, prev, series, shops[], topListings[] } */
export const getAnalyticsOverview = (days = 30) =>
  get(`/overview?days=${days}`, "Failed to load analytics");

/** Admin: one shop. { shop, days, totals, prev, series, topListings[] } */
export const getShopAnalytics = (id, days = 30) =>
  get(`/shops/${id}?days=${days}`, "Failed to load shop analytics");

/** Shop owner: own shop. { days, totals, prev, series, topListings[] } */
export const getMyAnalytics = (days = 30) =>
  get(`/mine?days=${days}`, "Failed to load analytics");