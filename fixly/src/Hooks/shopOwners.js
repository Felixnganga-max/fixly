import { getToken } from "./loginApi";

const BASE_URL = "https://fixly-wcao.vercel.app/fixly/shop-owners";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

async function send(url, opts, fallback) {
  const res = await fetch(url, { ...opts, headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || fallback);
  return json;
}

/** GET /api/shop-owners — { category?, offers?, verified?, active?, search?, page?, limit? } */
export async function getAllShopOwners(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.offers) query.set("offers", params.offers);
  if (params.verified !== undefined && params.verified !== "")
    query.set("verified", params.verified);
  if (params.active !== undefined && params.active !== "")
    query.set("active", params.active);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  return send(`${BASE_URL}?${query.toString()}`, {}, "Failed to fetch shop owners");
}

export async function getShopOwnerById(id) {
  return (await send(`${BASE_URL}/${id}`, {}, "Shop not found")).data;
}

/**
 * POST /api/shop-owners — enrolls the shop and creates their login.
 * Returns { shop, tempPassword }. tempPassword is shown ONCE; it is not stored in plain text.
 */
export async function createShopOwner(payload) {
  const json = await send(
    BASE_URL,
    { method: "POST", body: JSON.stringify(payload) },
    "Failed to create shop owner",
  );
  return { shop: json.data, tempPassword: json.tempPassword };
}

export async function updateShopOwner(id, payload) {
  return (
    await send(
      `${BASE_URL}/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      "Failed to update shop owner",
    )
  ).data;
}

export async function toggleVerified(id) {
  return (await send(`${BASE_URL}/${id}/verify`, { method: "PATCH" }, "Failed to toggle verified")).data;
}

export async function toggleActive(id) {
  return (await send(`${BASE_URL}/${id}/active`, { method: "PATCH" }, "Failed to toggle active")).data;
}

/** PATCH /api/shop-owners/:id/reset-password — returns { tempPassword } */
export async function resetShopPassword(id) {
  const json = await send(
    `${BASE_URL}/${id}/reset-password`,
    { method: "PATCH" },
    "Failed to reset password",
  );
  return { tempPassword: json.tempPassword };
}

export async function deleteShopOwner(id) {
  return send(`${BASE_URL}/${id}`, { method: "DELETE" }, "Failed to delete shop owner");
}