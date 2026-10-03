import { useLocation } from "react-router-dom";

const pageMeta = {
  "/admin": { title: "Dashboard" },
  "/admin/jobs": { title: "Jobs" },
  "/admin/technicians": { title: "Technicians" },
  "/admin/marketplace": { title: "Marketplace" },
  "/admin/library": { title: "Device Library" },
  "/admin/shop-owners": { title: "Shop Owners" },
  "/admin/purchases": { title: "Purchases" },
  "/admin/commissions": { title: "Commissions" },
  "/admin/settings": { title: "Settings", subtitle: "Platform configuration" },
};

export function useAdminPage() {
  const { pathname } = useLocation();
  return (
    pageMeta[pathname] ??
    Object.entries(pageMeta).find(
      ([key]) => key !== "/admin" && pathname.startsWith(key),
    )?.[1] ?? { title: "Admin", subtitle: "" }
  );
}