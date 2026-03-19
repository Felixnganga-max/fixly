import React from "react";
import { Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Request from "./pages/Request";
// import Confirmation from "./pages/Confirmation";
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

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/request/:device" element={<Request />} />
        {/* <Route path="/confirmation" element={<Confirmation />} /> */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          {/* Add these as you build them: */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="technicians" element={<Technicians />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
};

export default App;
