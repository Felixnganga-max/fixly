// routes/analyticsRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const a = require("../controllers/analyticsController");

const router = express.Router();

// Admin-only guard. Customer and shop-owner tokens carry a role and are refused.
// (Older admin tokens with no role field are treated as admin, as in the login flow.)
function adminOnly(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Not authorised" });
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    if (d.role && !["admin", "superadmin"].includes(d.role)) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    req.admin = d;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Session expired. Please log in again." });
  }
}

router.post("/track", a.track); // public
router.get("/summary", adminOnly, a.summary);
router.get("/shops/:id/events", adminOnly, a.shopEvents);

module.exports = router;