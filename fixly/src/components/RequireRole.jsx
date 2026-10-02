import { Navigate, useLocation } from "react-router-dom";
import { getToken, getRole, getUser, homeFor } from "../Hooks/loginApi";

/**
 * <RequireRole allow={["admin","superadmin"]}> … </RequireRole>
 * - no token            → /login
 * - wrong role          → that role's home
 * - shop owner on temp password → forced to /shop/change-password
 */
export default function RequireRole({ allow, children }) {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = getRole();
  if (!allow.includes(role)) {
    return <Navigate to={homeFor()} replace />;
  }

  if (
    role === "shop_owner" &&
    getUser()?.mustChangePassword &&
    location.pathname !== "/shop/change-password"
  ) {
    return <Navigate to="/shop/change-password" replace />;
  }

  return children;
}