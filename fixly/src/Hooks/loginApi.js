const BASE_URL = "https://fixly-wcao.vercel.app/fixly/auth";

/**
 * Login admin and persist token to localStorage
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, data: object }>}
 */
export async function loginAdmin(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Invalid credentials");
  }

  // Save token as "token" — used by your auth middleware/guard
  localStorage.setItem("token", json.token);

  return json;
}

/**
 * Get the stored token
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem("token");
}

/**
 * Remove token on logout
 */
export function clearToken() {
  localStorage.removeItem("token");
}
