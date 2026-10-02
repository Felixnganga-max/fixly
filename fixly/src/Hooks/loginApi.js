const BASE_URL = "https://fixly-wcao.vercel.app/fixly/auth";
const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * Sign in (admins AND shop owners — same endpoint).
 * Persists token + user ({ id, name, email, role, shopName?, slug?, offers?, category?, mustChangePassword? })
 */
export async function loginAdmin(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Invalid credentials");

  localStorage.setItem(TOKEN_KEY, json.token);
  localStorage.setItem(USER_KEY, JSON.stringify(json.data));
  return json;
}
export const login = loginAdmin;

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function updateStoredUser(patch) {
  const next = { ...(getUser() || {}), ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(next));
  return next;
}

/** Role from stored user, falling back to the JWT payload (covers sessions that predate this change). */
export function getRole() {
  const u = getUser();
  if (u?.role) return u.role;
  const t = getToken();
  if (!t) return null;
  try {
    const payload = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).role || null;
  } catch {
    return null;
  }
}

export const isShopOwner = () => getRole() === "shop_owner";

/** Where a signed-in user belongs. */
export function homeFor(user = getUser()) {
  const role = user?.role || getRole();
  if (role === "shop_owner") {
    return user?.mustChangePassword ? "/shop/change-password" : "/shop";
  }
  if (role === "admin" || role === "superadmin") return "/admin";
  return "/login";
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export const logout = clearToken;

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${BASE_URL}/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to change password");
  if (isShopOwner()) updateStoredUser({ mustChangePassword: false });
  return json;
}
