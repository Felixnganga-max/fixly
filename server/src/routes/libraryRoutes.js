// routes/libraryRoutes.js   (mounted at /fixly/library)
const express = require("express");
const jwt = require("jsonwebtoken");
const c = require("../controllers/libraryController");

const router = express.Router();

const verify = (req, res) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    res.status(401).json({ success: false, message: "Not authorised" });
    return null;
  }
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    // Older admin tokens have no role field: treated as admin, as in the login flow
    return { id: d.id || d._id, role: d.role || "admin" };
  } catch {
    res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    return null;
  }
};

// Admins and shop owners can read and add
const staffOnly = (req, res, next) => {
  const u = verify(req, res);
  if (!u) return;
  if (!["admin", "superadmin", "shop_owner"].includes(u.role)) {
    return res.status(403).json({ success: false, message: "Staff access only" });
  }
  req.staff = u;
  next();
};

// Editing, verifying and deleting stays with admins
const adminOnly = (req, res, next) =>
  staffOnly(req, res, () => {
    if (!["admin", "superadmin"].includes(req.staff.role)) {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    next();
  });

router.get("/", staffOnly, c.list);
router.get("/meta", staffOnly, c.meta); // before /:id
router.get("/:id", staffOnly, c.getOne);
router.post("/", staffOnly, c.create);
router.put("/:id", adminOnly, c.update);
router.delete("/:id", adminOnly, c.remove);

module.exports = router;