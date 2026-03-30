import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BadgeDollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
  ShoppingBag,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Jobs", href: "/admin/jobs", icon: ClipboardList },
  { label: "Technicians", href: "/admin/technicians", icon: Wrench },
  { label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
  { label: "Sales", href: "/admin/purchases", icon: BadgeDollarSign },
  { label: "Shop Owners", href: "/admin/shop-owners", icon: BadgeDollarSign },
  { label: "Commissions", href: "/admin/commissions", icon: BadgeDollarSign },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-black border-r border-black-border transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? "w-[68px]" : "w-[220px]"}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-[68px] border-b border-black-border px-5 flex-shrink-0 ${collapsed ? "justify-center" : "gap-2"}`}
      >
        {!collapsed && (
          <a
            href="/"
            className="font-display text-xl font-extrabold text-white tracking-tight"
          >
            Fix<span className="text-green">ly</span>
          </a>
        )}
        {collapsed && (
          <span className="font-display text-xl font-extrabold text-green">
            F
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            location.pathname === href ||
            (href !== "/admin" && location.pathname.startsWith(href));
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
      <div className="px-3 py-4 border-t border-black-border">
        <button
          onClick={() => navigate("/")}
          title={collapsed ? "Back to site" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white-muted hover:bg-black-hover hover:text-white transition-colors duration-150 w-full ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} strokeWidth={1.75} className="flex-shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[84px] w-6 h-6 bg-black border border-black-border rounded-full flex items-center justify-center text-white-muted hover:text-white transition-colors duration-150 z-10"
      >
        {collapsed ? (
          <ChevronRight size={12} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={12} strokeWidth={2.5} />
        )}
      </button>
    </aside>
  );
}
