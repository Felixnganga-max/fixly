const mongoose = require("mongoose");

const shopOwnerSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: [true, "Owner name is required"], trim: true },
    shopName: { type: String, required: [true, "Shop name is required"], trim: true },
    phone: { type: String, required: [true, "Phone is required"], trim: true },
    whatsapp: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    location: { type: String, required: [true, "Location is required"], trim: true },

    // Public URL: /s/:slug
    slug: { type: String, trim: true, lowercase: true },

    // Devices handled: phone, laptop, or both
    category: {
      type: [String],
      enum: ["phone", "laptop"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "At least one category (phone or laptop) is required",
      },
    },

    // What the shop does: sells devices, repairs devices, or both
    offers: {
      type: [String],
      enum: ["sell", "repair"],
      default: ["sell"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "At least one offer (sell or repair) is required",
      },
    },

    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },

    // ── Auth ───────────────────────────────────────────────
    password: { type: String, select: false },
    mustChangePassword: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },

    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

shopOwnerSchema.index({ slug: 1 }, { unique: true, sparse: true });
// Unique email, ignoring the empty-string legacy rows
shopOwnerSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $gt: "" } } },
);
shopOwnerSchema.index({ verified: 1 });
shopOwnerSchema.index({ active: 1 });
shopOwnerSchema.index({ category: 1 });
shopOwnerSchema.index({ offers: 1 });

module.exports = mongoose.model("ShopOwner", shopOwnerSchema);
