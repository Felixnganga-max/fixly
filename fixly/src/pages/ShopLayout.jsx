import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getUser } from "../Hooks/loginApi";

const TITLES = {
  "/shop": ["Overview", "Your shop at a glance"],
  "/shop/listings": ["Listings", "Manage the devices you sell"],
  "/shop/profile": ["My Shop", "How customers see your business"],
  "/shop/settings": ["Settings", "Account and security"],
};

export default function ShopLayout() {
  const { pathname } = useLocation();
  const [title, subtitle] = TITLES[pathname] || ["Shop", ""];
  const user = getUser();
  const initial = (user?.shopName || user?.name || "S").charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-beige overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Own light header — no admin-only search/notifications */}
        <header className="h-[68px] flex-shrink-0 border-b border-beige-dark bg-beige flex items-center justify-between px-6">
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-xl truncate" style={{ color: "#0D1117" }}>
              {title}
            </h1>
            {subtitle && <p className="text-gray-400 text-xs truncate">{subtitle}</p>}
          </div>
          <div className="w-10 h-10 rounded-full bg-black text-green font-bold flex items-center justify-center flex-shrink-0">
            {initial}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}