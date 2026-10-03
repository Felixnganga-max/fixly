// controllers/libraryController.js
const mongoose = require("mongoose");
const LibraryDevice = require("../models/deviceLibrary");
const MarketplaceListing = require("../models/Marketplacelisting");
const { pick, escapeRegex } = require("../utils/shopHelpers");
const { libraryKey } = require("../utils/libraryHelpers");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const FIELDS = [
  "category", "brand", "series", "name", "releaseYear",
  "shortDescription", "specs", "features", "variants", "colors",
];
// Extra fields accepted only by the bulk seed (ignored by the schema if it doesn't define them)
const SEED_FIELDS = [...FIELDS, "sourceUrl", "sources"];

const isAdmin = (req) => ["admin", "superadmin"].includes(req.staff.role);
const bad = (res, message, status = 400, data) => res.status(status).json({ success: false, message, data });

// GET /fixly/library?q=&category=&brand=&series=&verified=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const { q, category, brand, series, verified, page = 1, limit = 24 } = req.query;

  const filter = {};
  if (["phone", "laptop"].includes(category)) filter.category = category;
  if (brand) filter.brand = brand;
  if (series) filter.series = series;
  if (verified !== undefined) filter.verified = verified === "true";

  // "samsung s24" -> every word must appear in brand, series or name
  const terms = String(q || "").trim().split(/\s+/).filter(Boolean).slice(0, 6);
  if (terms.length) {
    filter.$and = terms.map((t) => {
      const rx = { $regex: escapeRegex(t), $options: "i" };
      return { $or: [{ name: rx }, { brand: rx }, { series: rx }] };
    });
  }

  const lim = Math.min(parseInt(limit) || 24, 60);
  const pg = Math.max(parseInt(page) || 1, 1);

  const [data, total] = await Promise.all([
    LibraryDevice.find(filter)
      .sort({ verified: -1, usageCount: -1, releaseYear: -1, name: 1 })
      .skip((pg - 1) * lim)
      .limit(lim)
      .lean(),
    LibraryDevice.countDocuments(filter),
  ]);

  res.json({ success: true, count: data.length, total, page: pg, hasMore: pg * lim < total, data });
});

// GET /fixly/library/meta?category=phone  -> brand filter chips
exports.meta = asyncHandler(async (req, res) => {
  const f = ["phone", "laptop"].includes(req.query.category) ? { category: req.query.category } : {};
  const brands = (await LibraryDevice.distinct("brand", f)).sort((a, b) => a.localeCompare(b));
  res.json({ success: true, data: { brands } });
});

// POST /fixly/library/seed   (admin only)
// Body: { devices: [{ category, brand, name, specs, features, ... }] }   max 50 per request
// Inserts devices that are not in the library yet. Existing entries are never overwritten.
// IMPORTANT: register this route ABOVE any "/:id" route.
exports.seed = asyncHandler(async (req, res) => {
  const { devices } = req.body || {};
  if (!Array.isArray(devices) || !devices.length) return bad(res, "devices array is required");
  if (devices.length > 50) return bad(res, "Send 50 devices or fewer per request");

  const ops = [];
  const invalid = [];
  const seen = new Set();

  for (const raw of devices) {
    const d = pick(raw || {}, SEED_FIELDS);
    const brand = String(d.brand || "").trim();
    const name = String(d.name || "").trim();

    if (!brand || !name || !["phone", "laptop"].includes(d.category)) {
      invalid.push(`${brand} ${name}`.trim() || "(unnamed entry)");
      continue;
    }

    const key = libraryKey(brand, name);
    if (seen.has(key)) continue; // duplicate inside the same upload
    seen.add(key);

    ops.push({
      updateOne: {
        filter: { key },
        update: {
          $setOnInsert: {
            ...d,
            brand,
            name,
            key,
            specs: d.specs && typeof d.specs === "object" ? d.specs : {},
            features: Array.isArray(d.features) ? d.features.map(String) : [],
            source: "admin",
            verified: true,
            createdBy: null,
          },
        },
        upsert: true,
      },
    });
  }

  let added = 0;
  if (ops.length) {
    const r = await LibraryDevice.bulkWrite(ops, { ordered: false });
    added = r.upsertedCount || 0;
  }

  res.json({
    success: true,
    added,
    skipped: ops.length - added, // already in the library
    invalid: invalid.length,
    invalidNames: invalid.slice(0, 10),
  });
});

// GET /fixly/library/:id
exports.getOne = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return bad(res, "Device not found", 404);
  const d = await LibraryDevice.findById(req.params.id).lean();
  if (!d) return bad(res, "Device not found", 404);
  res.json({ success: true, data: d });
});

// POST /fixly/library   (admin: verified; shop: community entry)
exports.create = asyncHandler(async (req, res) => {
  const body = pick(req.body, FIELDS);
  if (!body.brand || !body.name || !["phone", "laptop"].includes(body.category)) {
    return bad(res, "category, brand and name are required");
  }
  const key = libraryKey(body.brand, body.name);
  const hit = await LibraryDevice.findOne({ key }).select("_id");
  if (hit) return bad(res, "This device is already in the library", 409, { _id: hit._id });

  const admin = isAdmin(req);
  const doc = await LibraryDevice.create({
    ...body,
    key,
    source: admin ? "admin" : "shop",
    verified: admin,
    createdBy: admin ? null : req.staff.id,
  });
  res.status(201).json({ success: true, data: doc });
});

// PUT /fixly/library/:id   (admin only: edit specs, verify)
exports.update = asyncHandler(async (req, res) => {
  const updates = pick(req.body, [...FIELDS, "verified"]);
  const current = await LibraryDevice.findById(req.params.id);
  if (!current) return bad(res, "Device not found", 404);

  if (updates.brand || updates.name) {
    const key = libraryKey(updates.brand || current.brand, updates.name || current.name);
    if (key !== current.key) {
      if (await LibraryDevice.exists({ key, _id: { $ne: current._id } })) {
        return bad(res, "Another library entry already has that brand and name", 409);
      }
      updates.key = key;
    }
  }
  const doc = await LibraryDevice.findByIdAndUpdate(current._id, { $set: updates }, { new: true, runValidators: true });
  res.json({ success: true, data: doc });
});

// DELETE /fixly/library/:id   (admin only). Listings keep working, they just lose the link.
exports.remove = asyncHandler(async (req, res) => {
  const d = await LibraryDevice.findByIdAndDelete(req.params.id);
  if (!d) return bad(res, "Device not found", 404);
  await MarketplaceListing.updateMany({ libraryDevice: d._id }, { libraryDevice: null });
  res.json({ success: true, message: "Removed from library" });
});