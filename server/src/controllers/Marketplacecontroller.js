const mongoose = require("mongoose");
const MarketplaceListing = require("../models/Marketplacelisting");
const { cloudinary } = require("../config/cloudinary");
const { invalidateCache } = require("../utils/cache");
const { recordView } = require("../utils/viewWorker");
const { triggerPriceAlerts } = require("./priceAlerts");
const { pick, escapeRegex } = require("../utils/shopHelpers");
const { attachLibrary } = require("../utils/libraryHelpers");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const LISTING_CACHE_PATTERNS = [
  "cache:/api/marketplace*",
  "cache:/api/marketplace/stats*",
];

const ALLOWED_SORT_FIELDS = { createdAt: true, price: true, views: true, rating: true };

// Field whitelists — req.body is never spread into the DB.
const SHOP_FIELDS = [
  "category", "brand", "name", "price", "oldPrice", "condition",
  "shortDescription", "features", "specs", "active",
];
const ADMIN_FIELDS = [...SHOP_FIELDS, "verified", "listedBy", "rating", "reviews"];

// ── Ownership helpers ─────────────────────────────────────────
const isShop = (req) => req.user?.role === "shop_owner";
// Shop owners can only touch their own listings. Admins: no restriction.
const ownerFilter = (req) => (isShop(req) ? { listedBy: req.user.id } : {});

// Returns an error string if a shop owner isn't enrolled for this listing.
function shopCapabilityError(req, category) {
  if (!isShop(req)) return null;
  if (!req.user.offers?.includes("sell")) return "Your shop is not enrolled to sell devices";
  if (category && !req.user.category?.includes(category)) {
    return `Your shop is not enrolled for ${category} listings`;
  }
  return null;
}

const parseJson = (val, fallback) => {
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

// "Apple iPhone 15" with brand "Apple" -> "iPhone 15". Brand is stored separately,
// so keeping it in the name caused "Apple Apple iPhone 15" on screen and bad library keys.
const stripBrand = (name, brand) => {
  const n = String(name ?? "").trim();
  const b = String(brand ?? "").trim();
  if (!n || !b) return n;
  return n.replace(new RegExp(`^${escapeRegex(b)}\\s+`, "i"), "").trim() || n;
};

// ── Cloudinary helpers ────────────────────────────────────────
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
  await Promise.all(ids.map((id) => cloudinary.uploader.destroy(id))).catch(() => {});
}

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Listing not found" });

// ─────────────────────────────────────────────────────────────
// GET ALL — public, cursor pagination
// @route GET /api/marketplace
// Extra param: listedBy=<shopId> for a shop's public page
// ─────────────────────────────────────────────────────────────
exports.getAllListings = asyncHandler(async (req, res) => {
  const {
    category, brand, condition, verified, minPrice, maxPrice, search, listedBy,
    sortBy = "createdAt", order = "desc", limit: rawLimit = 20, cursor,
  } = req.query;

  const limit = Math.min(parseInt(rawLimit) || 20, 100);
  const sortDir = order === "asc" ? 1 : -1;
  const safeSortBy = ALLOWED_SORT_FIELDS[sortBy] ? sortBy : "createdAt";

  const filter = {};
  // TODO: `all=true` is honoured for anonymous callers. Move the admin view to
  // a protected route, then delete this.
  if (req.query.all !== "true") filter.active = true;
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (condition) filter.condition = condition;
  if (verified !== undefined) filter.verified = verified === "true";
  if (listedBy && mongoose.isValidObjectId(listedBy)) filter.listedBy = listedBy;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (search) filter.$text = { $search: search };

  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString());
      // Cursor values come back as strings. Mongo compares by type, so
      // dates and ObjectIds must be rehydrated or the comparison matches nothing.
      const sortVal =
        safeSortBy === "createdAt" ? new Date(decoded.sortVal) : decoded.sortVal;
      const id = new mongoose.Types.ObjectId(decoded.id);
      const op = sortDir === -1 ? "$lt" : "$gt";

      filter.$or = [
        { [safeSortBy]: { [op]: sortVal } },
        { [safeSortBy]: sortVal, _id: { [op]: id } },
      ];
    } catch {
      // Malformed cursor — return first page
    }
  }

  const sort = { [safeSortBy]: sortDir, _id: sortDir };

  const listings = await MarketplaceListing.find(filter)
    .populate("listedBy", "shopName slug location verified")
    .sort(sort)
    .limit(limit + 1);

  const hasNext = listings.length > limit;
  if (hasNext) listings.pop();

  let nextCursor = null;
  if (hasNext && listings.length) {
    const last = listings[listings.length - 1];
    nextCursor = Buffer.from(
      JSON.stringify({ sortVal: last[safeSortBy], id: last._id }),
    ).toString("base64url");
  }

  res.status(200).json({
    success: true,
    count: listings.length,
    hasNext,
    nextCursor,
    data: listings,
  });
});

// ─────────────────────────────────────────────────────────────
// GET MINE — shop owner's own listings (all states), uncached
// @route GET /api/marketplace/mine   @access Shop owner
// ─────────────────────────────────────────────────────────────
exports.getMyListings = asyncHandler(async (req, res) => {
  const { category, active, search, page = 1, limit = 50 } = req.query;

  const filter = { listedBy: req.user.id };
  if (category) filter.category = category;
  if (active !== undefined) filter.active = active === "true";
  if (search) filter.$text = { $search: search };

  const lim = Math.min(parseInt(limit) || 50, 100);
  const skip = (Math.max(parseInt(page) || 1, 1) - 1) * lim;

  const [listings, total] = await Promise.all([
    MarketplaceListing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
    MarketplaceListing.countDocuments(filter),
  ]);

  res.status(200).json({ success: true, count: listings.length, total, data: listings });
});

// ─────────────────────────────────────────────────────────────
// GET SINGLE
// @route GET /api/marketplace/:id   @access Public
// ─────────────────────────────────────────────────────────────
exports.getListingById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

  const listing = await MarketplaceListing.findById(req.params.id).populate(
    "listedBy",
    "shopName slug location phone whatsapp logo verified",
  );
  if (!listing) return notFound(res);

  recordView(listing._id).catch(() => {});
  res.status(200).json({ success: true, data: listing });
});

// ─────────────────────────────────────────────────────────────
// CREATE   @route POST /api/marketplace   @access Admin | Shop owner
// Body may include `libraryDevice` (library entry id) when listing from the library.
// ─────────────────────────────────────────────────────────────
exports.createListing = asyncHandler(async (req, res) => {
  const cleanup = async () => {
    if (req.files?.length) await destroyCloudinaryImages(req.files.map((f) => f.path));
  };

  const { category, brand, name, price, condition, shortDescription } = req.body;

  if (!category || !brand || !name || !price || !condition || !shortDescription) {
    await cleanup();
    return res.status(400).json({
      success: false,
      message: "category, brand, name, price, condition and shortDescription are required",
    });
  }

  const capErr = shopCapabilityError(req, category);
  if (capErr) {
    await cleanup();
    return res.status(403).json({ success: false, message: capErr });
  }

  const data = pick(req.body, isShop(req) ? SHOP_FIELDS : ADMIN_FIELDS);
  data.name = stripBrand(data.name, data.brand);

  let specs = parseJson(req.body.specs, {});
  if (!specs || typeof specs !== "object") specs = {};
  let features = parseJson(req.body.features, []);
  if (!Array.isArray(features)) features = [];

  data.specs = specs;
  data.features = features;
  data.images = req.files?.map((f) => f.path) ?? [];
  // Shop listings are always tagged to the shop. Admin may assign one or leave Fixly-owned.
  data.listedBy = isShop(req) ? req.user.id : data.listedBy || null;

  // Link to (or create) the shared library entry. Must never block the listing itself.
  try {
    await attachLibrary(data, {
      shopId: isShop(req) ? req.user.id : null,
      fromId: req.body.libraryDevice,
    });
  } catch (err) {
    console.error("[createListing] attachLibrary failed:", err.message);
  }

  let listing;
  try {
    listing = await MarketplaceListing.create(data);
  } catch (err) {
    await cleanup(); // don't leave orphaned Cloudinary images on a failed save
    throw err;
  }

  await invalidateCache(LISTING_CACHE_PATTERNS);

  res.status(201).json({ success: true, message: "Listing created", data: listing });
});

// ─────────────────────────────────────────────────────────────
// UPDATE   @route PUT /api/marketplace/:id   @access Admin | owning shop
// ─────────────────────────────────────────────────────────────
exports.updateListing = asyncHandler(async (req, res) => {
  const cleanup = async () => {
    if (req.files?.length) await destroyCloudinaryImages(req.files.map((f) => f.path));
  };

  if (!mongoose.isValidObjectId(req.params.id)) {
    await cleanup();
    return notFound(res);
  }

  // 404 (not 403) for other shops' listings — don't leak existence
  const listing = await MarketplaceListing.findOne({
    _id: req.params.id,
    ...ownerFilter(req),
  });
  if (!listing) {
    await cleanup();
    return notFound(res);
  }

  const updates = pick(req.body, isShop(req) ? SHOP_FIELDS : ADMIN_FIELDS);

  const capErr = shopCapabilityError(req, updates.category);
  if (capErr) {
    await cleanup();
    return res.status(403).json({ success: false, message: capErr });
  }

  if (updates.name !== undefined || updates.brand !== undefined) {
    updates.name = stripBrand(updates.name ?? listing.name, updates.brand ?? listing.brand);
  }

  const oldPrice = listing.price;

  if (req.body.specs !== undefined) {
    const specs = parseJson(req.body.specs, listing.specs);
    updates.specs = specs && typeof specs === "object" ? specs : listing.specs;
  }
  if (req.body.features !== undefined) {
    const features = parseJson(req.body.features, listing.features);
    updates.features = Array.isArray(features) ? features : listing.features;
  }
  if (updates.listedBy === "") updates.listedBy = null; // admin un-assigning

  const oldImages = listing.images;
  if (req.files?.length) {
    updates.images = req.files.map((f) => f.path);
  }

  let updated;
  try {
    updated = await MarketplaceListing.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );
  } catch (err) {
    await cleanup();
    throw err;
  }

  // Only remove the old photos once the new ones are safely saved
  if (req.files?.length) await destroyCloudinaryImages(oldImages);

  triggerPriceAlerts(updated, oldPrice).catch((err) =>
    console.error("[updateListing] triggerPriceAlerts error:", err.message),
  );

  await invalidateCache(LISTING_CACHE_PATTERNS);
  res.status(200).json({ success: true, message: "Listing updated", data: updated });
});

// ─────────────────────────────────────────────────────────────
// DELETE SINGLE IMAGE
// @route DELETE /api/marketplace/:id/image   Body: { imageUrl }
// ─────────────────────────────────────────────────────────────
exports.deleteImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ success: false, message: "imageUrl is required" });
  }
  if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

  const listing = await MarketplaceListing.findOne({
    _id: req.params.id,
    ...ownerFilter(req),
  });
  if (!listing) return notFound(res);

  // Only destroy images that actually belong to this listing
  if (!listing.images.includes(imageUrl)) {
    return res.status(404).json({ success: false, message: "Image not found on this listing" });
  }

  const publicId = extractPublicId(imageUrl);
  if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});

  listing.images = listing.images.filter((img) => img !== imageUrl);
  await listing.save();
  await invalidateCache(LISTING_CACHE_PATTERNS);

  res.status(200).json({ success: true, message: "Image removed", data: listing });
});

// ─────────────────────────────────────────────────────────────
// TOGGLE ACTIVE
// ─────────────────────────────────────────────────────────────
exports.toggleActive = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

  const listing = await MarketplaceListing.findOne({
    _id: req.params.id,
    ...ownerFilter(req),
  });
  if (!listing) return notFound(res);

  listing.active = !listing.active;
  await listing.save();
  await invalidateCache(LISTING_CACHE_PATTERNS);

  res.status(200).json({
    success: true,
    message: `Listing ${listing.active ? "published" : "hidden"}`,
    data: listing,
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE LISTING
// ─────────────────────────────────────────────────────────────
exports.deleteListing = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

  const listing = await MarketplaceListing.findOne({
    _id: req.params.id,
    ...ownerFilter(req),
  });
  if (!listing) return notFound(res);

  await destroyCloudinaryImages(listing.images);
  await listing.deleteOne();
  await invalidateCache(LISTING_CACHE_PATTERNS);

  res.status(200).json({ success: true, message: "Listing deleted", data: {} });
});

// ─────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────
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
      total, active, verified, phones, laptops,
      byCondition: { new: newCount, used, refurbished: refurb },
    },
  });
});