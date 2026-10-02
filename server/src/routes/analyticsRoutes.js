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

// Shop-owner guard: a shop only ever sees its own numbers.
function shopOwnerOnly(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Not authorised" });
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    const id = d.id || d._id;
    if (d.role !== "shop_owner" || !id) {
      return res.status(403).json({ success: false, message: "Shop owner access only" });
    }
    req.shopOwnerId = id;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Session expired. Please log in again." });
  }
}

// The browser sends tracking as text/plain: a "simple" request, so there is no CORS
// preflight that could silently block it. Parse that body as JSON here.
const parseTrack = [
  express.text({ type: "text/plain", limit: "4kb" }),
  (req, res, next) => {
    if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        req.body = {};
      }
    }
    next();
  },
];

router.post("/track", ...parseTrack, a.track); // public
router.get("/me", shopOwnerOnly, a.myPerformance);
router.get("/summary", adminOnly, a.summary);
router.get("/shops/:id/events", adminOnly, a.shopEvents);

module.exports = router;