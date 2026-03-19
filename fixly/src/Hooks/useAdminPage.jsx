import { useLocation } from "react-router-dom";

const pageMeta = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Overview of all platform activity",
  },
  "/admin/jobs": {
    title: "Jobs",
    subtitle: "Manage and assign repair requests",
  },
  "/admin/technicians": {
    title: "Technicians",
    subtitle: "Manage verified specialists",
  },
  "/admin/commissions": {
    title: "Commissions",
    subtitle: "Track and record platform earnings",
  },
  "/admin/settings": { title: "Settings", subtitle: "Platform configuration" },
};

export function useAdminPage() {
  const { pathname } = useLocation();

  // Match exact, then prefix
  return (
    pageMeta[pathname] ??
    Object.entries(pageMeta).find(
      ([key]) => key !== "/admin" && pathname.startsWith(key),
    )?.[1] ?? { title: "Admin", subtitle: "" }
  );
}
