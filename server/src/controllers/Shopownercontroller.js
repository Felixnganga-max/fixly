const ShopOwner = require("../models/shopOwners");
const Technician = require("../models/technicians");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Get all shop owners
// @route  GET /api/shop-owners
// @access Private/Admin
exports.getAllShopOwners = asyncHandler(async (req, res) => {
  const {
    category,
    verified,
    active,
    search,
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};
  if (category !== undefined) filter.category = category;
  if (verified !== undefined) filter.verified = verified === "true";
  if (active !== undefined) filter.active = active === "true";
  if (search) {
    filter.$or = [
      { shopName: { $regex: search, $options: "i" } },
      { ownerName: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [shops, total] = await Promise.all([
    ShopOwner.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ShopOwner.countDocuments(filter),
  ]);

  res
    .status(200)
    .json({ success: true, count: shops.length, total, data: shops });
});

// @desc   Get single shop owner
// @route  GET /api/shop-owners/:id
// @access Private/Admin
exports.getShopOwnerById = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop)
    return res.status(404).json({ success: false, message: "Shop not found" });

  // Also pull technicians linked to this shop
  const technicians = await Technician.find({ shopOwner: shop._id }).select(
    "name category availability verified",
  );

  res
    .status(200)
    .json({ success: true, data: { ...shop.toObject(), technicians } });
});

// @desc   Register new shop owner
// @route  POST /api/shop-owners
// @access Private/Admin
exports.createShopOwner = asyncHandler(async (req, res) => {
  const {
    ownerName,
    shopName,
    phone,
    email,
    location,
    category,
    description,
    verified,
    notes,
  } = req.body;

  if (!ownerName || !shopName || !phone || !location || !category?.length) {
    return res.status(400).json({
      success: false,
      message: "ownerName, shopName, phone, location and category are required",
    });
  }

  const shop = await ShopOwner.create({
    ownerName,
    shopName,
    phone,
    email: email || "",
    location,
    category,
    description: description || "",
    verified: verified ?? false,
    notes: notes || "",
  });

  res
    .status(201)
    .json({ success: true, message: "Shop owner registered", data: shop });
});

// @desc   Update shop owner
// @route  PUT /api/shop-owners/:id
// @access Private/Admin
exports.updateShopOwner = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!shop)
    return res.status(404).json({ success: false, message: "Shop not found" });
  res.status(200).json({ success: true, message: "Shop updated", data: shop });
});

// @desc   Toggle verified status
// @route  PATCH /api/shop-owners/:id/verify
// @access Private/Admin
exports.toggleVerified = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop)
    return res.status(404).json({ success: false, message: "Shop not found" });

  shop.verified = !shop.verified;
  await shop.save();

  res.status(200).json({
    success: true,
    message: `Shop ${shop.verified ? "verified" : "unverified"}`,
    data: shop,
  });
});

// @desc   Toggle active status
// @route  PATCH /api/shop-owners/:id/active
// @access Private/Admin
exports.toggleActive = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findById(req.params.id);
  if (!shop)
    return res.status(404).json({ success: false, message: "Shop not found" });

  shop.active = !shop.active;
  await shop.save();

  res.status(200).json({
    success: true,
    message: `Shop ${shop.active ? "activated" : "deactivated"}`,
    data: shop,
  });
});

// @desc   Delete shop owner
// @route  DELETE /api/shop-owners/:id
// @access Private/Admin
exports.deleteShopOwner = asyncHandler(async (req, res) => {
  const shop = await ShopOwner.findByIdAndDelete(req.params.id);
  if (!shop)
    return res.status(404).json({ success: false, message: "Shop not found" });
  res
    .status(200)
    .json({ success: true, message: "Shop owner removed", data: {} });
});
