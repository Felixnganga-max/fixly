// routes/customerRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const c = require("../controllers/customerController");

const router = express.Router();

// Customer-only guard. Kept separate from the admin/shop `protect` middleware.
function customerAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Please log in" });
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    if (d.role !== "customer") {
      return res.status(403).json({ success: false, message: "Customer account required" });
    }
    req.customer = { id: d.id };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Session expired. Please log in again." });
  }
}

router.post("/register", c.register);
router.post("/login", c.login);
router.get("/me", customerAuth, c.me);
router.get("/shops/:key/contact", customerAuth, c.shopContact);

module.exports = router;