const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const ShopOwner = require("../models/shopOwners");
const { JWT_SECRET } = require("../config/jwt");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const signToken = (id, role) => jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });

const invalid = (res) =>
  res.status(401).json({ success: false, message: "Invalid credentials" });

// @route POST /api/auth/login   @access Public
// Same endpoint for admins and shop owners. Admin match wins.
exports.login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  let account = await Admin.findOne({ email }).select("+password");
  let role;

  if (account) {
    if (!account.active) return invalid(res);
    role = account.role;
  } else {
    account = await ShopOwner.findOne({ email }).select("+password");
    if (!account || !account.active || !account.password) return invalid(res);
    role = "shop_owner";
  }

  const isMatch = await bcrypt.compare(password, account.password);
  if (!isMatch) return invalid(res);

  const token = signToken(account._id, role);

  if (role === "shop_owner") {
    await ShopOwner.updateOne({ _id: account._id }, { lastLoginAt: new Date() });
    return res.status(200).json({
      success: true,
      token,
      data: {
        id: account._id,
        name: account.ownerName,
        email: account.email,
        role,
        shopName: account.shopName,
        slug: account.slug,
        offers: account.offers,
        category: account.category,
        mustChangePassword: account.mustChangePassword,
      },
    });
  }

  res.status(200).json({
    success: true,
    token,
    data: { id: account._id, name: account.name, email: account.email, role },
  });
});

// @route GET /api/auth/me   @access Private
exports.getMe = asyncHandler(async (req, res) => {
  if (req.user.role === "shop_owner") {
    const shop = await ShopOwner.findById(req.user.id);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    return res.status(200).json({ success: true, data: shop });
  }
  const admin = await Admin.findById(req.user.id);
  if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });
  res.status(200).json({ success: true, data: admin });
});

// @route PATCH /api/auth/change-password   @access Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Both current and new password are required",
    });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ success: false, message: "New password must be at least 8 characters" });
  }
  if (newPassword === currentPassword) {
    return res
      .status(400)
      .json({ success: false, message: "New password must differ from the current one" });
  }

  const isShop = req.user.role === "shop_owner";
  const Model = isShop ? ShopOwner : Admin;
  const account = await Model.findById(req.user.id).select("+password");

  const isMatch = await bcrypt.compare(currentPassword, account.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Current password is incorrect" });
  }

  const update = { password: await bcrypt.hash(newPassword, 12) };
  if (isShop) update.mustChangePassword = false;
  await Model.updateOne({ _id: account._id }, { $set: update });

  res.status(200).json({ success: true, message: "Password updated successfully" });
});