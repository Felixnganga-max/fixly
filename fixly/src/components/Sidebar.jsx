import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BadgeDollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
  ShoppingBag,
  Store,
  Globe,
  UserCircle,
  BookMarked,
} from "lucide-react";
import { getUser, getRole, logout } from "../Hooks/loginApi";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Jobs", href: "/admin/jobs", icon: ClipboardList },
  { label: "Technicians", href: "/admin/technicians", icon: Wrench },
  { label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
  { label: "Library", href: "/admin/library", icon: BookMarked },
  { label: "Sales", href: "/admin/purchases", icon: BadgeDollarSign },
  { label: "Shop Owners", href: "/admin/shop-owners", icon: Store },
  { label: "Commissions", href: "/admin/commissions", icon: BadgeDollarSign },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function shopNav(user) {
  const items = [{ label: "Overview", href: "/shop", icon: LayoutDashboard }];
  // Services (repair shops) lands in step 5
  if (user?.offers?.includes("sell") ?? true) {
    items.push({ label: "Listings", href: "/shop/listings", icon: ShoppingBag });
    items.push({ label: "Library", href: "/shop/library", icon: BookMarked });
  }
  items.push(
    { label: "My Shop", href: "/shop/profile", icon: UserCircle },
    { label: "Settings", href: "/shop/settings", icon: Settings },
  );
  return items;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = getUser();
  const isShop = getRole() === "shop_owner";
  const root = isShop ? "/shop" : "/admin";
  const navItems = isShop ? shopNav(user) : adminNav;

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const footBtn =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white-muted hover:bg-black-hover hover:text-white transition-colors duration-150 w-full";

  return (
    <aside
      className={`relative flex flex-col bg-black border-r border-black-border transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? "w-[68px]" : "w-[220px]"}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-[68px] border-b border-black-border px-5 flex-shrink-0 ${collapsed ? "justify-center" : "gap-2"}`}
      >
        {!collapsed && (
          <a href="/" className="font-display text-xl font-extrabold text-white tracking-tight">
            Fix<span className="text-green">ly</span>
          </a>
        )}
        {collapsed && <span className="font-display text-xl font-extrabold text-green">F</span>}
      </div>

      {/* Shop identity */}
      {isShop && !collapsed && user?.shopName && (
        <div className="px-5 py-3 border-b border-black-border">
          <p className="text-white text-sm font-semibold truncate">{user.shopName}</p>
          <p className="text-white-muted text-xs truncate">{user.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            location.pathname === href ||
            (href !== root && location.pathname.startsWith(href));
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 w-full text-left ${active ? "bg-green-subtle text-green" : "text-white-muted hover:bg-black-hover hover:text-white"} ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={18} strokeWidth={1.75} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-black-border flex flex-col gap-1">
        <button
          onClick={() => navigate("/")}
          title={collapsed ? "Back to site" : undefined}
          className={`${footBtn} ${collapsed ? "justify-center" : ""}`}
        >
          <Globe size={18} strokeWidth={1.75} className="flex-shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </button>
        <button
          onClick={signOut}
          title={collapsed ? "Sign out" : undefined}
          className={`${footBtn} ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} strokeWidth={1.75} className="flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[84px] w-6 h-6 bg-black border border-black-border rounded-full flex items-center justify-center text-white-muted hover:text-white transition-colors duration-150 z-10"
      >
        {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronLeft size={12} strokeWidth={2.5} />}
      </button>
    </aside>
  );
}