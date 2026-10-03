// utils/libraryHelpers.js
const mongoose = require("mongoose");
const LibraryDevice = require("../models/deviceLibrary");

const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// "Apple" + "Apple iPhone 17" and "Apple" + "iPhone 17" both give "apple-iphone-17"
const libraryKey = (brand, name) => {
  const b = slug(brand);
  const n = slug(name);
  return n === b || n.startsWith(`${b}-`) ? n : `${b}-${n}`;
};

/**
 * Call right before creating a listing.
 *  - listing made FROM the library  -> link it and count the use
 *  - listing made from scratch      -> add the device to the library (first entry wins;
 *                                      an existing entry is never overwritten) and link it
 * Sets data.libraryDevice. Never throws: a library problem must not block a listing.
 */
async function attachLibrary(data, { shopId = null, fromId = null } = {}) {
  data.libraryDevice = null;
  try {
    if (fromId && mongoose.isValidObjectId(fromId)) {
      const hit = await LibraryDevice.findByIdAndUpdate(fromId, { $inc: { usageCount: 1 } }, { new: true }).select("_id");
      if (hit) {
        data.libraryDevice = hit._id;
        return;
      }
    }
    if (!data.brand || !data.name || !data.category) return;

    const key = libraryKey(data.brand, data.name);
    const doc = {
      key,
      category: data.category,
      brand: data.brand,
      name: data.name,
      shortDescription: data.shortDescription || "",
      specs: data.specs || {},
      features: data.features || [],
      source: shopId ? "shop" : "admin",
      verified: false,
      createdBy: shopId,
    };
    const run = () =>
      LibraryDevice.findOneAndUpdate({ key }, { $setOnInsert: doc, $inc: { usageCount: 1 } }, { upsert: true, new: true }).select("_id");

    let entry;
    try {
      entry = await run();
    } catch (err) {
      if (err.code !== 11000) throw err;
      entry = await run(); // two shops added the same device at the same moment
    }
    data.libraryDevice = entry._id;
  } catch (err) {
    console.error("[library] attachLibrary:", err.message);
  }
}

module.exports = { libraryKey, attachLibrary };