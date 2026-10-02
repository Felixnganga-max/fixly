import { useState, useEffect } from "react";

const BASE = "https://fixly-wcao.vercel.app/fixly/customers";
// Separate keys so a customer login never collides with admin / shop sessions
const TOKEN_KEY = "fixly_customer_token";
const USER_KEY = "fixly_customer";
const EVT = "fixly-customer-change";

export const getCustomerToken = () => localStorage.getItem(TOKEN_KEY);
export const getCustomer = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

const save = (token, customer) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(customer));
  window.dispatchEvent(new Event(EVT));
};

export const customerLogout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(EVT));
};

async function call(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers.Authorization = `Bearer ${getCustomerToken()}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return json;
}

export async function registerCustomer(payload) {
  const json = await call("/register", { method: "POST", body: payload });
  save(json.token, json.data);
  return json.data;
}

export async function loginCustomer(email, password) {
  const json = await call("/login", { method: "POST", body: { email, password } });
  save(json.token, json.data);
  return json.data;
}

/** Returns { shopName, phone, whatsapp }. Needs a logged-in customer. */
export async function getShopContact(key) {
  try {
    return (await call(`/shops/${encodeURIComponent(key)}/contact`, { auth: true })).data;
  } catch (err) {
    if (err.status === 401) customerLogout(); // expired / invalid token
    throw err;
  }
}

/** Re-renders when the customer logs in or out (any tab). */
export function useCustomer() {
  const [customer, setCustomer] = useState(getCustomer());
  useEffect(() => {
    const sync = () => setCustomer(getCustomer());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return customer;
}