const MarketplaceListing = require("../models/Marketplacelisting");
const { cloudinary } = require("../config/cloudinary");
const { invalidateCache } = require("../utils/cache");
const { recordView } = require("../utils/viewWorker");
const { triggerPriceAlerts } = require("./priceAlerts");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Cache patterns to bust whenever listings change
const LISTING_CACHE_PATTERNS = [
  "cache:/api/marketplace*",
  "cache:/api/marketplace/stats*",
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract Cloudinary public_id from a secure URL.
 * URL format: https://res.cloudinary.com/<cloud>/image/upload/<version>/<folder>/<filename>.<ext>
 * public_id = "<folder>/<filename>"  (no extension)
 */
function extractPublicId(url) {
  try {
    const parts = url.split("/");
    const file = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${file}`;
  } catch {
    return null;
  }
}

async function destroyCloudinaryImages(urls = []) {
  const ids = urls.map(extractPublicId).filter(Boolean);
  await Promise.all(ids.map((id) => cloudinary.uploader.destroy(id))).catch(
    () => {},
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL LISTINGS — cursor pagination + full-text search + Redis cache
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Get listings with cursor-based pagination
// @route  GET /api/marketplace
// @access Public
//
// Query params:
//   category, brand, condition, verified, minPrice, maxPrice, search
//   sortBy (createdAt|price|views|rating)  order (asc|desc)
//   limit (default 20)
//   cursor  — _id of the last item from the previous page (for next page)
//   all     — "true" to include inactive (admin only)
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
    limit: rawLimit = 20,
    cursor, // _id cursor for pagination
  } = req.query;

  const limit = Math.min(parseInt(rawLimit) || 20, 100); // cap at 100
  const sortDir = order === "asc" ? 1 : -1;

  // ── Build filter ────────────────────────────────────────────
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

  if (search) filter.$text = { $search: search };

  // ── Cursor pagination ───────────────────────────────────────
  // We sort by the chosen field + _id as tiebreaker.
  // The cursor encodes both values to maintain stable order.
  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString());
      // decoded: { sortVal, id }
      const sortField = ALLOWED_SORT_FIELDS[sortBy] ? sortBy : "createdAt";

      if (sortDir === -1) {
        // Descending: next page has smaller sort value (or same value with smaller _id)
        filter.$or = [
          { [sortField]: { $lt: decoded.sortVal } },
          {
            [sortField]: decoded.sortVal,
            _id: { $lt: decoded.id },
          },
        ];
      } else {
        filter.$or = [
          { [sortField]: { $gt: decoded.sortVal } },
          {
            [sortField]: decoded.sortVal,
            _id: { $gt: decoded.id },
          },
        ];
      }
    } catch {
      // Malformed cursor — ignore, return first page
    }
  }

  // ── Sort ────────────────────────────────────────────────────
  const ALLOWED_SORT_FIELDS = {
    createdAt: true,
    price: true,
    views: true,
    rating: true,
  };
  const safeSortBy = ALLOWED_SORT_FIELDS[sortBy] ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortDir, _id: sortDir }; // _id as tiebreaker

  // ── Query ────────────────────────────────────────────────────
  const listings = await MarketplaceListing.find(filter)
    .populate("listedBy", "shopName location")
    .sort(sort)
    .limit(limit + 1); // fetch one extra to detect if there's a next page

  const hasNext = listings.length > limit;
  if (hasNext) listings.pop();

  // ── Build next cursor ───────────────────────────────────────
  let nextCursor = null;
  if (hasNext && listings.length) {
    const last = listings[listings.length - 1];
    const payload = { sortVal: last[safeSortBy], id: last._id };
    nextCursor = Buffer.from(JSON.stringify(payload)).toString("base64url");
  }

  res.status(200).json({
    success: true,
    count: listings.length,
    hasNext,
    nextCursor, // pass as ?cursor= on next request
    data: listings,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE LISTING — async view count via Redis queue
// ─────────────────────────────────────────────────────────────────────────────

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

  // Fire-and-forget: queue the view increment — never blocks the response
  recordView(listing._id).catch(() => {});

  res.status(200).json({ success: true, data: listing });
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE LISTING
// ─────────────────────────────────────────────────────────────────────────────

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
    if (req.files?.length)
      await destroyCloudinaryImages(req.files.map((f) => f.path));
    return res.status(400).json({
      success: false,
      message:
        "category, brand, name, price, condition and shortDescription are required",
    });
  }

  const imageUrls = req.files?.map((f) => f.path) ?? [];

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

  // Bust cached listing pages so the new item appears immediately
  await invalidateCache(LISTING_CACHE_PATTERNS);

  res
    .status(201)
    .json({ success: true, message: "Listing created", data: listing });
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE LISTING — price alerts triggered here
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Update listing
// @route  PUT /api/marketplace/:id
// @access Private/Admin
exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) {
    if (req.files?.length)
      await destroyCloudinaryImages(req.files.map((f) => f.path));
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  const oldPrice = listing.price; // snapshot before update

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

  if (req.files?.length) {
    const newUrls = req.files.map((f) => f.path);
    await destroyCloudinaryImages(listing.images);
    updates.images = newUrls;
  }

  const updated = await MarketplaceListing.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true },
  );

  // Check price drop alerts — non-blocking, never fails the request
  triggerPriceAlerts(updated, oldPrice).catch((err) =>
    console.error("[updateListing] triggerPriceAlerts error:", err.message),
  );

  await invalidateCache(LISTING_CACHE_PATTERNS);

  res
    .status(200)
    .json({ success: true, message: "Listing updated", data: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE SINGLE IMAGE
// ─────────────────────────────────────────────────────────────────────────────

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

  const publicId = extractPublicId(imageUrl);
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});

  listing.images = listing.images.filter((img) => img !== imageUrl);
  await listing.save();

  await invalidateCache(LISTING_CACHE_PATTERNS);

  res
    .status(200)
    .json({ success: true, message: "Image removed", data: listing });
});

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE ACTIVE
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Toggle listing active/hidden
// @route  PATCH /api/marketplace/:id/toggle-active
// @access Private/Admin
exports.toggleActive = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  listing.active = !listing.active;
  await listing.save();

  await invalidateCache(LISTING_CACHE_PATTERNS);

  res.status(200).json({
    success: true,
    message: `Listing ${listing.active ? "published" : "hidden"}`,
    data: listing,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE LISTING
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Delete listing (also purges Cloudinary images)
// @route  DELETE /api/marketplace/:id
// @access Private/Admin
exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id);
  if (!listing) {
    return res
      .status(404)
      .json({ success: false, message: "Listing not found" });
  }

  await destroyCloudinaryImages(listing.images);
  await listing.deleteOne();
  await invalidateCache(LISTING_CACHE_PATTERNS);

  res.status(200).json({ success: true, message: "Listing deleted", data: {} });
});

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

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
