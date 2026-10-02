import { getToken, clearToken, updateStoredUser } from "./loginApi";

const ROOT = "https://fixly-wcao.vercel.app/fixly";
const SHOPS_URL = `${ROOT}/shop-owners`;
const MARKET_URL = `${ROOT}/marketplace`;

async function call(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (json.code === "PASSWORD_CHANGE_REQUIRED") {
      updateStoredUser({ mustChangePassword: true });
      window.location.assign("/shop/change-password");
    } else if (res.status === 401) {
      clearToken();
      window.location.assign("/login");
    }
    throw new Error(json.message || "Request failed");
  }
  return json;
}

/** The signed-in shop's own profile */
export async function getMyShop() {
  return (await call(`${SHOPS_URL}/me`)).data;
}

/** phone, whatsapp, location, description, logo, banner */
export async function updateMyShop(payload) {
  return (await call(`${SHOPS_URL}/me`, { method: "PUT", body: JSON.stringify(payload) })).data;
}

/** The signed-in shop's own listings (all states). Returns { data, total } */
export async function getMyListings(params = {}) {
  const q = new URLSearchParams();
  ["category", "active", "search", "page", "limit"].forEach((k) => {
    if (params[k] !== undefined && params[k] !== "") q.set(k, params[k]);
  });
  return call(`${MARKET_URL}/mine?${q.toString()}`);
}