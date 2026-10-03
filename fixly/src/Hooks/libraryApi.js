import { getToken } from "./loginApi";

const BASE = "https://fixly-wcao.vercel.app/fixly/library";

async function call(path = "", { method = "GET", body, params, signal } = {}) {
  const token = getToken();
  if (!token) throw new Error("Please log in again");

  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, v);
  });

  const res = await fetch(`${BASE}${path}${qs.toString() ? `?${qs}` : ""}`, {
    method,
    signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || "Library request failed");
    err.status = res.status;
    err.data = json.data;
    throw err;
  }
  return json;
}

/** { data: [device], total, page, hasMore }.  params: q, category, brand, series, verified, page, limit */
export const searchLibrary = (params, signal) => call("", { params, signal });

/** { brands: [...] } for the filter chips */
export const getLibraryMeta = (category) => call("/meta", { params: { category } }).then((j) => j.data);

export const getLibraryDevice = (id) => call(`/${id}`).then((j) => j.data);

/** Add a device to the library by hand. Admin entries are Verified, shop entries are Community. */
export const createLibraryDevice = (body) => call("", { method: "POST", body }).then((j) => j.data);

/** Admin only */
export const updateLibraryDevice = (id, body) => call(`/${id}`, { method: "PUT", body }).then((j) => j.data);
export const deleteLibraryDevice = (id) => call(`/${id}`, { method: "DELETE" });

/**
 * Turns a library device into the fields of the listing form.
 * Prices, images and condition are NOT included: the shop enters those.
 * `libraryDevice` links the new listing back to the library entry.
 */
export const libraryToListing = (d) => ({
  category: d.category,
  brand: d.brand,
  name: d.name,
  shortDescription: d.shortDescription || "",
  features: d.features || [],
  specs: d.specs || {},
  libraryDevice: d._id,
});