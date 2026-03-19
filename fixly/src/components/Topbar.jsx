import { Bell, Search } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <header className="h-[68px] bg-beige border-b border-beige-dark flex items-center justify-between px-6 flex-shrink-0">
      {/* Left — page title */}
      <div>
        <h1
          className="font-display font-extrabold text-black text-lg leading-tight"
          style={{ color: "#0D1117" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-white border border-beige-dark rounded-lg px-3 py-2 text-sm text-gray-400 w-52">
          <Search size={14} strokeWidth={2} className="flex-shrink-0" />
          <span className="text-xs">Search jobs...</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 bg-white border border-beige-dark rounded-xl flex items-center justify-center hover:border-gray-400 transition-colors duration-200">
          <Bell size={16} strokeWidth={1.75} className="text-gray-500" />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green rounded-full" />
        </button>

        {/* Admin avatar */}
        <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center font-display font-bold text-green text-sm flex-shrink-0">
          A
        </div>
      </div>
    </header>
  );
}
