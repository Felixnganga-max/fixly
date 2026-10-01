const bcrypt = require("bcryptjs");
const ShopOwner = require("../models/shopOwners");
const Technician = require("../models/technicians");
const Admin = require("../models/admin");
const MarketplaceListing = require("../models/Marketplacelisting");
const { invalidateCache } = require("../utils/cache");
const {
  uniqueSlug,
  generateTempPassword,
  pick,
  escapeRegex,
} = require("../utils/shopHelpers");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const LISTING_CACHE_PATTERNS = ["cache:/api/marketplace*", "cache:/api/marketplace/stats*"];

// Whitelists — never pass req.body straight into the DB
const ADMIN_FIELDS = [
  "ownerName", "shopName", "phone", "whatsapp", "email", "location",
  "category", "offers", "description", "logo", "banner",
  "verified", "active", "notes",
];
const SELF_FIELDS = ["phone", "whatsapp", "location", "description", "logo", "banner"];

const safe = (doc) => {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  delete o.password;
  return o;
};

const emailTaken = async (email, exceptShopId = null) => {
  if (!email) return false;
  if (await Admin.exists({ email })) return true;
  const q = { email };
  if (exceptShopId) q._id = { $ne: exceptShopId };
  return !!(await ShopOwner.exists(q));
};

const conflict = (res, message) => res.status(409).json({ success: false, message });

// @route GET /api/shop-owners   @access Admin
exports.getAllShopOwners = asyncHandler(async (req, res) => {
  const { category, offers, verified, active, search, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (offers) filter.offers = offers;
  if (verified !== undefined) filter.verified = verified === "true";
  if (active !== undefined) filter.active = active === "true";
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ shopName: rx }, { ownerName: rx }, { location: rx }];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [shops, total] = await Promise.all([
    ShopOwner.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    ShopOwner.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: shops.length, total, data: shops });
});

// @route GET /api/shop-owners/:id   @access Admin
exports.getShopOwnerById = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

  const [technicians, listingCount] = await Promise.all([
    Technician.find({ shopOwner: shop._id }).select("name category availability verified"),
    MarketplaceListing.countDocuments({ listedBy: shop._id }),
  ]);

  res
    .status(200)
    .json({ success: true, data: { ...shop.toObject(), technicians, listingCount } });
});

// @desc   Enroll a shop owner. Returns a one-time temp password to hand over.
// @route  POST /api/shop-owners   @access Admin
exports.createShopOwner = asyncHandler(async (req, res) => {
  const { ownerName, shopName, phone, location, category } = req.body;
  const email = String(req.body.email || "").trim().toLowerCase();
  const offers =
    Array.isArray(req.body.offers) && req.body.offers.length ? req.body.offers : ["sell"];

  if (!ownerName || !shopName || !phone || !location || !email || !category?.length) {
    return res.status(400).json({
      success: false,
      message: "ownerName, shopName, phone, email, location and category are required",
    });
  }
  if (await emailTaken(email)) return conflict(res, "That email is already in use");

  const tempPassword = generateTempPassword();
  const slug = await uniqueSlug(ShopOwner, shopName);

  let shop;
  try {
    shop = await ShopOwner.create({
      ...pick(req.body, ADMIN_FIELDS),
      email,
      offers,
      slug,
      password: await bcrypt.hash(tempPassword, 12),
      mustChangePassword: true,
    });
  } catch (err) {
    if (err.code === 11000) return conflict(res, "That email or shop URL is already in use");
    throw err;
  }

  res.status(201).json({
    success: true,
    message: "Shop owner enrolled",
    data: safe(shop),
    tempPassword, // shown once — send via WhatsApp/SMS. Not stored in plain text.
  });
});

// @route PUT /api/shop-owners/:id   @access Admin
exports.updateShopOwner = asyncHandler(async (req, res) => {
  const updates = pick(req.body, ADMIN_FIELDS);

  if (updates.email !== undefined) {
    updates.email = String(updates.email).trim().toLowerCase();
    if (await emailTaken(updates.email, req.params.id)) {
      return conflict(res, "That email is already in use");
    }
  }

  let shop;
  try {
    shop = await ShopOwner.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );
  } catch (err) {
    if (err.code === 11000) return conflict(res, "That email is already in use");
    throw err;
  }
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

  if (updates.active === false) {
    await MarketplaceListing.updateMany({ listedBy: shop._id }, { active: false });
    await invalidateCache(LISTING_CACHE_PATTERNS);
  }

  res.status(200).json({ success: true, message: "Shop updated", data: shop });
});

// @route PATCH /api/shop-owners/:id/verify   @access Admin
exports.toggleVerified = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

  shop.verified = !shop.verified;
  await shop.save();

  res.status(200).json({
    success: true,
    message: `Shop ${shop.verified ? "verified" : "unverified"}`,
    data: shop,
  });
});

// @desc   Deactivating a shop also hides its listings and blocks login.
//         Reactivating does NOT auto-republish listings — owner does that.
// @route  PATCH /api/shop-owners/:id/active   @access Admin
exports.toggleActive = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

  shop.active = !shop.active;
  await shop.save();

  if (!shop.active) {
    await MarketplaceListing.updateMany({ listedBy: shop._id }, { active: false });
    await invalidateCache(LISTING_CACHE_PATTERNS);
  }

  res.status(200).json({
    success: true,
    message: `Shop ${shop.active ? "activated" : "deactivated"}`,
    data: shop,
  });
});

// @desc   Issue a fresh temp password (forgotten password / re-invite)
// @route  PATCH /api/shop-owners/:id/reset-password   @access Admin
exports.resetPassword = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
  if (!shop.email) {
    return res
      .status(400)
      .json({ success: false, message: "Shop has no email — add one first" });
  }

  const tempPassword = generateTempPassword();
  await ShopOwner.updateOne(
    { _id: shop._id },
    { $set: { password: await bcrypt.hash(tempPassword, 12), mustChangePassword: true } },
  );

  res.status(200).json({ success: true, message: "Password reset", tempPassword });
});

// @desc   Delete — blocked while the shop still has listings (deactivate instead)
// @route  DELETE /api/shop-owners/:id   @access Admin
exports.deleteShopOwner = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

  const listings = await MarketplaceListing.countDocuments({ listedBy: shop._id });
  if (listings > 0) {
    return conflict(
      res,
      `Shop has ${listings} listing(s). Deactivate it, or delete the listings first.`,
    );
  }

  await Technician.updateMany({ shopOwner: shop._id }, { shopOwner: null });
  await shop.deleteOne();

  res.status(200).json({ success: true, message: "Shop owner removed", data: {} });
});

// ── Shop owner self-service ──────────────────────────────────

// @route GET /api/shop-owners/me   @access Shop owner
exports.getMyShop = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.user.id);
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
  res.status(200).json({ success: true, data: shop });
});

// @route PUT /api/shop-owners/me   @access Shop owner
// Name, email, slug, verified, category, offers stay admin-only.
exports.updateMyShop = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findByIdAndUpdate(
    req.user.id,
    { $set: pick(req.body, SELF_FIELDS) },
    { new: true, runValidators: true },
  );
  if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
  res.status(200).json({ success: true, message: "Profile updated", data: shop });
});