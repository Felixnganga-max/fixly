const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const signToken = (id, role) =>
  jwt.sign({ id, role }, "fixly_super_secret_jwt_key_2024", {
    expiresIn: "7d",
  });

// @desc   Admin sign in
// @route  POST /api/auth/login
// @access Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !admin.active) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = signToken(admin._id, admin.role);
  admin.password = undefined;

  res.status(200).json({
    success: true,
    token,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

// @desc   Get current logged-in admin
// @route  GET /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }
  res.status(200).json({ success: true, data: admin });
});

// @desc   Change password
// @route  PATCH /api/auth/change-password
// @access Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Both current and new password are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  const admin = await Admin.findById(req.user.id).select("+password");

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Current password is incorrect" });
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});
