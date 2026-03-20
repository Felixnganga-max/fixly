const MarketplaceListing = require("../models/Marketplacelisting");

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

  // Admin can pass ?all=true to see inactive listings too
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

  // Increment views
  listing.views += 1;
  await listing.save();

  res.status(200).json({ success: true, data: listing });
});

// @desc   Create listing
// @route  POST /api/marketplace
// @access Private/Admin
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
    return res.status(400).json({
      success: false,
      message:
        "category, brand, name, price, condition and shortDescription are required",
    });
  }

  const listing = await MarketplaceListing.create(req.body);
  res
    .status(201)
    .json({ success: true, message: "Listing created", data: listing });
});

// @desc   Update listing
// @route  PUT /api/marketplace/:id
// @access Private/Admin
exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!listing)
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  res
    .status(200)
    .json({ success: true, message: "Listing updated", data: listing });
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

// @desc   Delete listing
// @route  DELETE /api/marketplace/:id
// @access Private/Admin
exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findByIdAndDelete(req.params.id);
  if (!listing)
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
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
