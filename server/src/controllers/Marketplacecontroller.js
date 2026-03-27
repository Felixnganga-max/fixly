const MarketplaceListing = require("../models/Marketplacelisting");
const { cloudinary } = require("../config/cloudinary");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc   Get all listings (public — active only by default)
// @route  GET /api/marketplace
// @access Public
exports.getAllListings = asyncHandler(async (req, res) => {
  const {
    category,
    brand,
    condition,
    verified,
    minPrice,
    maxPrice,
    search,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  if (req.query.all !== "true") filter.active = true;

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (condition) filter.condition = condition;
  if (verified !== undefined) filter.verified = verified === "true";

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  const [listings, total] = await Promise.all([
    MarketplaceListing.find(filter)
      .populate("listedBy", "shopName location")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    MarketplaceListing.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: listings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: listings,
  });
});

// @desc   Get single listing by ID
// @route  GET /api/marketplace/:id
// @access Public
exports.getListingById = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id).populate(
    "listedBy",
    "shopName location phone",
  );

  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  listing.views += 1;
  await listing.save();

  res.status(200).json({ success: true, data: listing });
});

// @desc   Create listing (with up to 10 Cloudinary images)
// @route  POST /api/marketplace
// @access Private/Admin
// Middleware: uploadProductImages (multer-cloudinary) must run before this
exports.createListing = asyncHandler(async (req, res) => {
  const { category, brand, name, price, condition, shortDescription } =
    req.body;

  if (
    !category ||
    !brand ||
    !name ||
    !price ||
    !condition ||
    !shortDescription
  ) {
    // Clean up any uploaded images if validation fails
    if (req.files?.length) {
      await Promise.all(
        req.files.map((f) =>
          cloudinary.uploader.destroy(f.filename || f.public_id),
        ),
      );
    }
    return res.status(400).json({
      success: false,
      message:
        "category, brand, name, price, condition and shortDescription are required",
    });
  }

  // Collect Cloudinary secure URLs from uploaded files
  const imageUrls = req.files?.map((f) => f.path) ?? [];

  // Parse specs / features if sent as JSON strings (multipart forms)
  let specs = req.body.specs;
  let features = req.body.features;

  try {
    if (typeof specs === "string") specs = JSON.parse(specs);
  } catch {
    specs = {};
  }
  try {
    if (typeof features === "string") features = JSON.parse(features);
    if (!Array.isArray(features)) features = [];
  } catch {
    features = [];
  }

  const listing = await MarketplaceListing.create({
    ...req.body,
    specs,
    features,
    images: imageUrls,
  });

  res
    .status(201)
    .json({ success: true, message: "Listing created", data: listing });
});

// @desc   Update listing (optionally add/replace images)
// @route  PUT /api/marketplace/:id
// @access Private/Admin
// Middleware: uploadProductImages is optional — attach only when images need updating
exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) {
    if (req.files?.length) {
      await Promise.all(
        req.files.map((f) =>
          cloudinary.uploader.destroy(f.filename || f.public_id),
        ),
      );
    }
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  // Parse JSON fields from multipart
  let specs = req.body.specs;
  let features = req.body.features;
  try {
    if (typeof specs === "string") specs = JSON.parse(specs);
  } catch {
    specs = listing.specs;
  }
  try {
    if (typeof features === "string") features = JSON.parse(features);
    if (!Array.isArray(features)) features = listing.features;
  } catch {
    features = listing.features;
  }

  const updates = { ...req.body, specs, features };

  // If new images uploaded, replace the old set and delete old Cloudinary assets
  if (req.files?.length) {
    const newUrls = req.files.map((f) => f.path);

    // Delete old images from Cloudinary
    const oldPublicIds = listing.images
      .map((url) => {
        // Extract public_id from Cloudinary URL
        const parts = url.split("/");
        const file = parts[parts.length - 1].split(".")[0];
        const folder = parts[parts.length - 2];
        return `${folder}/${file}`;
      })
      .filter(Boolean);

    if (oldPublicIds.length) {
      await Promise.all(
        oldPublicIds.map((pid) => cloudinary.uploader.destroy(pid)),
      ).catch(() => {}); // Non-fatal
    }

    updates.images = newUrls;
  }

  const updated = await MarketplaceListing.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true },
  );

  res
    .status(200)
    .json({ success: true, message: "Listing updated", data: updated });
});

// @desc   Delete a single image from a listing
// @route  DELETE /api/marketplace/:id/image
// @access Private/Admin
// Body: { imageUrl: "https://res.cloudinary.com/..." }
exports.deleteImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res
      .status(400)
      .json({ success: false, message: "imageUrl is required" });
  }

  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  // Extract public_id from URL: ...fixly/marketplace/product_xxx.jpg
  const parts = imageUrl.split("/");
  const file = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${file}`;

  await cloudinary.uploader.destroy(publicId).catch(() => {});

  listing.images = listing.images.filter((img) => img !== imageUrl);
  await listing.save();

  res.status(200).json({
    success: true,
    message: "Image removed",
    data: listing,
  });
});

// @desc   Toggle listing active/hidden
// @route  PATCH /api/marketplace/:id/toggle-active
// @access Private/Admin
exports.toggleActive = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing)
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });

  listing.active = !listing.active;
  await listing.save();

  res.status(200).json({
    success: true,
    message: `Listing ${listing.active ? "published" : "hidden"}`,
    data: listing,
  });
});

// @desc   Delete listing (also purges Cloudinary images)
// @route  DELETE /api/marketplace/:id
// @access Private/Admin
exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing)
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });

  // Purge images from Cloudinary
  if (listing.images?.length) {
    const publicIds = listing.images
      .map((url) => {
        const parts = url.split("/");
        const file = parts[parts.length - 1].split(".")[0];
        const folder = parts[parts.length - 2];
        return `${folder}/${file}`;
      })
      .filter(Boolean);

    await Promise.all(
      publicIds.map((pid) => cloudinary.uploader.destroy(pid)),
    ).catch(() => {});
  }

  await listing.deleteOne();
  res.status(200).json({ success: true, message: "Listing deleted", data: {} });
});

// @desc   Marketplace stats
// @route  GET /api/marketplace/stats
// @access Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [total, active, verified, phones, laptops, newCount, used, refurb] =
    await Promise.all([
      MarketplaceListing.countDocuments(),
      MarketplaceListing.countDocuments({ active: true }),
      MarketplaceListing.countDocuments({ verified: true }),
      MarketplaceListing.countDocuments({ category: "phone" }),
      MarketplaceListing.countDocuments({ category: "laptop" }),
      MarketplaceListing.countDocuments({ condition: "New" }),
      MarketplaceListing.countDocuments({ condition: "Used" }),
      MarketplaceListing.countDocuments({ condition: "Refurbished" }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      active,
      verified,
      phones,
      laptops,
      byCondition: { new: newCount, used, refurbished: refurb },
    },
  });
});
