// models/deviceLibrary.js
// One entry per device MODEL: specs only. No images, prices or condition (those belong to a shop's listing).
const mongoose = require("mongoose");

const deviceLibrarySchema = new mongoose.Schema(
  {
    // Readable unique ID, e.g. "apple-iphone-17". Same brand+name always gives the same key.
    key: { type: String, required: true, unique: true, trim: true },

    category: { type: String, enum: ["phone", "laptop"], required: true },
    brand: { type: String, required: true, trim: true },
    series: { type: String, trim: true, default: "" }, // e.g. "Galaxy S", "iPhone 17"
    name: { type: String, required: true, trim: true },
    releaseYear: { type: Number, default: null },

    shortDescription: { type: String, trim: true, default: "" },
    // Same keys the listing form uses (screenSize, ram, storage, processor, battery, ...)
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },
    features: { type: [String], default: [] },
    variants: { type: [{ _id: false, ram: String, storage: String }], default: [] },
    colors: { type: [String], default: [] },
    sourceUrl: { type: String, default: "" },

    // seed = researched by Fixly, admin = added by admin, shop = captured from a shop's listing
    source: { type: String, enum: ["seed", "admin", "shop"], default: "seed" },
    verified: { type: Boolean, default: false }, // true = checked by Fixly
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "ShopOwner", default: null },
    usageCount: { type: Number, default: 0 }, // listings created from this entry
  },
  { timestamps: true },
);

deviceLibrarySchema.index({ category: 1, brand: 1 });
deviceLibrarySchema.index({ verified: -1, usageCount: -1 });

module.exports = mongoose.model("LibraryDevice", deviceLibrarySchema);