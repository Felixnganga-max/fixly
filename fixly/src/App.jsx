import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Request from "./pages/Request";
import ProductDetail from "./pages/ProductDetails";

// Admin
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./components/Dashboard";
import Jobs from "./components/Jobs";
import JobDetail from "./components/JobDetail";
import Technicians from "./components/Technicians";
import Commissions from "./components/Comissions";
import Settings from "./components/Settings";
import Marketplace from "./pages/Marketplace";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/About";
import Login from "./pages/Login";
import DashboardMarketplace from "./pages/DashboardMarketplace";
import AddListingPage from "./components/AddListingPage";
import { getToken } from "./Hooks/loginApi"; // adjust path if needed

// ── Auth guard ────────────────────────────────────────────────
function RequireAuth({ children }) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// ── Layout wrapper — hides Navbar/Footer on /dashboard/* ──────
function PublicLayout({ children }) {
  const { pathname } = useLocation();
  const isDashboard =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

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
        <Route path="/about-us" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* ── Dashboard (auth-gated, no Navbar/Footer) ── */}
        <Route
          path="/dashboard/marketplace/add"
          element={
            <RequireAuth>
              <AddListingPage />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard/marketplace/edit/:id"
          element={
            <RequireAuth>
              <AddListingPage />
            </RequireAuth>
          }
        />

        {/* ── Admin (auth-gated, no Navbar/Footer) ── */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="technicians" element={<Technicians />} />
          <Route path="marketplace" element={<DashboardMarketplace />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </PublicLayout>
  );
};

export default App;
