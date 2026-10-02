import { getToken } from "./loginApi";

const BASE = "https://fixly-wcao.vercel.app/fixly/analytics";

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Failed to load analytics");
  return json.data;
}

/** { days, shops: [{ shopId, shopName, pageViews, uniqueVisitors, productViews, whatsappClicks, callClicks, contactReveals, leads }] } */
export const getAnalyticsSummary = (days = 30) => get(`/summary?days=${days}`);

export const getShopEvents = (shopId, { days = 30, type = "", limit = 100 } = {}) =>
  get(`/shops/${shopId}/events?days=${days}&limit=${limit}${type ? `&type=${type}` : ""}`);

export const getShopAnalytics = (shopId, days = 30) =>
  get(`/shops/${shopId}?days=${days}`);

export const getMyAnalytics = (days = 30) =>
  get(`/me?days=${days}`);

// Used by ShopAnalytics.jsx (admin overview of all shops)
export const getAnalyticsOverview = (days = 30) =>
  get(`/overview?days=${days}`);

// Used by MyShopStats.jsx (older shop-owner view)
export const getMyAnalyticsSummary = (days = 30) =>
  get(`/me/summary?days=${days}`);

export const getMyShopEvents = ({ days = 30, type = "", limit = 100 } = {}) =>
  get(`/me/events?days=${days}&limit=${limit}${type ? `&type=${type}` : ""}`);