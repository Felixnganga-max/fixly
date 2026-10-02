// routes/analyticsRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const a = require("../controllers/analyticsController");

const router = express.Router();

function verify(req, res) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    res.status(401).json({ success: false, message: "Not authorised" });
    return null;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    return null;
  }
}

// Admin-only guard. Customer and shop-owner tokens carry a role and are refused.
// (Older admin tokens with no role field are treated as admin, as in the login flow.)
function adminOnly(req, res, next) {
  const d = verify(req, res);
  if (!d) return;
  if (d.role && !["admin", "superadmin"].includes(d.role)) {
    return res.status(403).json({ success: false, message: "Admin access only" });
  }
  req.admin = d;
  next();
}

// Shop-owner guard. Role matching is loose ("shop_owner", "shopOwner", "shop-owner" all pass).
function shopOwnerOnly(req, res, next) {
  const d = verify(req, res);
  if (!d) return;
  const role = String(d.role || "").toLowerCase().replace(/[^a-z]/g, "");
  if (role !== "shopowner") {
    return res.status(403).json({ success: false, message: "Shop owner access only" });
  }
  req.user = { ...d, id: d.id || d._id };
  next();
}

router.post("/track", a.track); // public
router.get("/summary", adminOnly, a.summary);
router.get("/overview", adminOnly, a.overview);
router.get("/shops/:id", adminOnly, a.shopReport);
router.get("/shops/:id/events", adminOnly, a.shopEvents);
router.get("/me", shopOwnerOnly, a.myReport);

module.exports = router;