const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

// ─────────────────────────────────────────────────────────────
// protect — verifies JWT on every protected route
// Usage: router.get("/", protect, handler)
// ─────────────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Accept: Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorised — please sign in",
      });
    }

    // Verify signature and expiry
    const decoded = jwt.verify(token, "fixly_super_secret_jwt_key_2024");

    // Confirm admin still exists and is active in DB
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.active) {
      return res.status(401).json({
        success: false,
        message: "This account no longer exists or has been deactivated",
      });
    }

    // Attach to request for downstream controllers
    req.user = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired — please sign in again",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token — please sign in again",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Not authorised",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// adminOnly — role check, always use AFTER protect
// Usage: router.get("/", protect, adminOnly, handler)
// ─────────────────────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (
    !req.user ||
    (req.user.role !== "admin" && req.user.role !== "superadmin")
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied — admins only",
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// superAdminOnly — only superadmin passes
// Usage: router.delete("/", protect, superAdminOnly, handler)
// ─────────────────────────────────────────────────────────────
exports.superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Access denied — superadmin only",
    });
  }
  next();
};
