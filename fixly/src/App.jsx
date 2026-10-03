import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Request from "./pages/Request";
import ProductDetail from "./pages/ProductDetails";
import Marketplace from "./pages/Marketplace";
import ShopPage from "./pages/ShopPage";
import ShopDirectory from "./pages/ShopDirectory";
import About from "./pages/About";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Admin
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./components/Dashboard";
import Jobs from "./components/Jobs";
import JobDetail from "./components/JobDetail";
import Technicians from "./components/Technicians";
import Commissions from "./components/Comissions";
import Settings from "./components/Settings";
import DashboardMarketplace from "./pages/DashboardMarketplace";
import AddListingPage from "./components/AddListingPage";
import PurchaseAdmin from "./pages/PurchaseAdmin";
import ShopOwners from "./components/ShopOwners";
import Analytics from "./components/Analytics";
import DeviceLibrary from "./components/DeviceLibrary";

// Shop owner
import RequireRole from "./components/RequireRole";
import ShopLayout from "./pages/ShopLayout";
import ShopOverview from "./components/ShopOverview";
import ShopListings from "./components/ShopListings";
import ShopProfile from "./components/ShopProfile";
import ChangePassword from "./components/ChangePassword";

const ADMIN = ["admin", "superadmin"];
const SHOP = ["shop_owner"];

// Hides Navbar/Footer on dashboard areas
function PublicLayout({ children }) {
  const { pathname } = useLocation();
  const isDashboard =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/shop" ||
    pathname.startsWith("/shop/");

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
}

const App = () => {
  return (
    <PublicLayout>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/request/:device" element={<Request />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/s/:slug" element={<ShopPage />} />
        <Route path="/shops/:category" element={<ShopDirectory />} />
        <Route path="/repair-shops/:category" element={<ShopDirectory />} />
        {/* /shop-name/shop-id (static routes above always win) */}
        <Route path="/:slug/:shopId" element={<ShopPage />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* ── Admin: listing form (full page) ── */}
        <Route
          path="/dashboard/marketplace/add"
          element={<RequireRole allow={ADMIN}><AddListingPage /></RequireRole>}
        />
        <Route
          path="/dashboard/marketplace/edit/:id"
          element={<RequireRole allow={ADMIN}><AddListingPage /></RequireRole>}
        />

        {/* ── Admin ── */}
        <Route
          path="/admin"
          element={<RequireRole allow={ADMIN}><AdminLayout /></RequireRole>}
        >
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="technicians" element={<Technicians />} />
          <Route path="marketplace" element={<DashboardMarketplace />} />
          <Route path="purchases" element={<PurchaseAdmin />} />
          <Route path="shop-owners" element={<ShopOwners />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="library" element={<DeviceLibrary />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Shop owner: full-page screens ── */}
        <Route
          path="/shop/change-password"
          element={<RequireRole allow={SHOP}><ChangePassword /></RequireRole>}
        />
        <Route
          path="/shop/listings/new"
          element={<RequireRole allow={SHOP}><AddListingPage /></RequireRole>}
        />
        <Route
          path="/shop/listings/edit/:id"
          element={<RequireRole allow={SHOP}><AddListingPage /></RequireRole>}
        />

        {/* ── Shop owner dashboard ── */}
        <Route
          path="/shop"
          element={<RequireRole allow={SHOP}><ShopLayout /></RequireRole>}
        >
          <Route index element={<ShopOverview />} />
          <Route path="listings" element={<ShopListings />} />
          <Route path="profile" element={<ShopProfile />} />
          <Route path="library" element={<DeviceLibrary />} />
          <Route path="settings" element={<ChangePassword />} />
        </Route>
      </Routes>
    </PublicLayout>
  );
};

export default App;