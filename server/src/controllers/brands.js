const Brand = require("../models/brand");
const { cloudinary } = require("../config/cloudinary");
const { invalidateCache } = require("../utils/cache");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const BRAND_CACHE_PATTERNS = ["cache:/api/brands*", "cache:/api/marketplace*"];

// @desc   Get all active brands (public)
// @route  GET /api/brands?category=phone|laptop|all
// @access Public
exports.getBrands = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const filter = { active: true };
  if (category && ["phone", "laptop"].includes(category)) {
    // Return brands for the given category PLUS brands marked "all"
    filter.category = { $in: [category, "all"] };
  }

  const brands = await Brand.find(filter).sort({ sortOrder: 1, name: 1 });

  res.status(200).json({ success: true, count: brands.length, data: brands });
});

// @desc   Get all brands including inactive (admin)
// @route  GET /api/brands/admin
// @access Private/Admin
exports.getAllBrandsAdmin = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ sortOrder: 1, name: 1 });
  res.status(200).json({ success: true, count: brands.length, data: brands });
});

// @desc   Create a brand
// @route  POST /api/brands
// @access Private/Admin
exports.createBrand = asyncHandler(async (req, res) => {
  const { name, category, sortOrder } = req.body;

  if (!name) {
    if (req.file)
      await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
    return res
      .status(400)
      .json({ success: false, message: "name is required" });
  }

  const logo = req.file?.path ?? null;

  const brand = await Brand.create({ name, category, logo, sortOrder });
  await invalidateCache(BRAND_CACHE_PATTERNS);

  res
    .status(201)
    .json({ success: true, message: "Brand created", data: brand });
});

// @desc   Update a brand
// @route  PUT /api/brands/:id
// @access Private/Admin
exports.updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    if (req.file)
      await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
    return res.status(404).json({ success: false, message: "Brand not found" });
  }

  const updates = { ...req.body };

  if (req.file) {
    // Delete old logo from Cloudinary
    if (brand.logo) {
      const parts = brand.logo.split("/");
      const file = parts[parts.length - 1].split(".")[0];
      const folder = parts[parts.length - 2];
      await cloudinary.uploader.destroy(`${folder}/${file}`).catch(() => {});
    }
    updates.logo = req.file.path;
  }

  const updated = await Brand.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  await invalidateCache(BRAND_CACHE_PATTERNS);

  res
    .status(200)
    .json({ success: true, message: "Brand updated", data: updated });
});

// @desc   Delete a brand
// @route  DELETE /api/brands/:id
// @access Private/Admin
exports.deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return res.status(404).json({ success: false, message: "Brand not found" });
  }

  if (brand.logo) {
    const parts = brand.logo.split("/");
    const file = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    await cloudinary.uploader.destroy(`${folder}/${file}`).catch(() => {});
  }

  await brand.deleteOne();
  await invalidateCache(BRAND_CACHE_PATTERNS);

  res.status(200).json({ success: true, message: "Brand deleted", data: {} });
});

// @desc   Reorder brands (bulk sortOrder update)
// @route  PATCH /api/brands/reorder
// @access Private/Admin
// Body: { order: ["brandId1", "brandId2", ...] }
exports.reorderBrands = asyncHandler(async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res
      .status(400)
      .json({ success: false, message: "order must be an array of brand IDs" });
  }

  await Promise.all(
    order.map((id, idx) => Brand.findByIdAndUpdate(id, { sortOrder: idx })),
  );

  await invalidateCache(BRAND_CACHE_PATTERNS);

  res.status(200).json({ success: true, message: "Brands reordered" });
});
