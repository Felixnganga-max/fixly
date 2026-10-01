const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const ShopOwner = require("../models/shopOwners");
const { JWT_SECRET } = require("../config/jwt");

const deny = (res, message, status = 401, extra = {}) =>
  res.status(status).json({ success: false, message, ...extra });

// protect — verifies JWT, loads Admin or ShopOwner into req.user
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return deny(res, "Not authorised — please sign in");

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === "shop_owner") {
      const shop = await ShopOwner.findById(decoded.id).select("-password");
      if (!shop || !shop.active) {
        return deny(res, "This account no longer exists or has been deactivated");
      }
      req.user = {
        id: shop._id,
        name: shop.ownerName,
        email: shop.email,
        role: "shop_owner",
        shopName: shop.shopName,
        slug: shop.slug,
        category: shop.category,
        offers: shop.offers,
        mustChangePassword: shop.mustChangePassword,
      };
      return next();
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || !admin.active) {
      return deny(res, "This account no longer exists or has been deactivated");
    }
    req.user = { id: admin._id, name: admin.name, email: admin.email, role: admin.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") return deny(res, "Session expired — please sign in again");
    if (err.name === "JsonWebTokenError") return deny(res, "Invalid token — please sign in again");
    return deny(res, "Not authorised");
  }
};

// adminOnly — admin/superadmin. Shop owners never pass.
exports.adminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
    return deny(res, "Access denied — admins only", 403);
  }
  next();
};

exports.superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return deny(res, "Access denied — superadmin only", 403);
  }
  next();
};

const needsPasswordChange = (req, res) =>
  req.user.role === "shop_owner" && req.user.mustChangePassword
    ? deny(res, "Change your temporary password to continue", 403, {
        code: "PASSWORD_CHANGE_REQUIRED",
      })
    : null;

// shopOnly — shop owners only (blocked until temp password is changed)
exports.shopOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "shop_owner") {
    return deny(res, "Access denied — shop owners only", 403);
  }
  return needsPasswordChange(req, res) || next();
};

// staffOnly — admin, superadmin or shop owner
exports.staffOnly = (req, res, next) => {
  if (!req.user) return deny(res, "Not authorised");
  const ok = ["admin", "superadmin", "shop_owner"].includes(req.user.role);
  if (!ok) return deny(res, "Access denied", 403);
  return needsPasswordChange(req, res) || next();
};