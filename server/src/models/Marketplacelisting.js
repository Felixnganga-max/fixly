const mongoose = require("mongoose");

// One sellable version of a device, e.g. 8GB RAM / 256GB storage, with its own price.
const variantSchema = new mongoose.Schema(
  {
    ram: { type: String, trim: true, default: "" },
    storage: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },
    inStock: { type: Boolean, default: true },
  },
  { _id: false },
);

const marketplaceListingSchema = new mongoose.Schema(
  {
    // ── Core fields ─────────────────────────────────────────────
    category: { type: String, enum: ["phone", "laptop"], required: true },

    // brand is now a plain string — no enum.
    // Validation against the Brand collection is done in the controller.
    brand: { type: String, required: true, trim: true },

    name: { type: String, required: true, trim: true },

    // With variants, `price` is the cheapest in-stock version (set by the controller),
    // so sorting, filtering, price alerts and "from KES X" keep working.
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },

    // Priced RAM/storage versions. Empty = a single-price listing.
    variants: { type: [variantSchema], default: [] },

    condition: {
      type: String,
      enum: ["New", "Used", "Refurbished"],
      required: true,
    },

    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },

    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },

    shortDescription: { type: String, required: true, trim: true },
    features: { type: [String], default: [] },
    images: { type: [String], default: [] },

    // Flexible spec object — keys defined by frontend productAssets.js
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Which shop owner listed this device
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOwner",
      default: null,
    },

    // Device library entry this listing was made from (or created)
    libraryDevice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryDevice",
      default: null,
    },

    // views: incremented asynchronously via Redis queue (not on every request)
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Virtual: discount % ─────────────────────────────────────────
marketplaceListingSchema.virtual("discount").get(function () {
  if (this.oldPrice && this.oldPrice > this.price) {
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }
  return null;
});

// ── Virtual: does this listing have several priced versions? ────
marketplaceListingSchema.virtual("hasVariants").get(function () {
  return Array.isArray(this.variants) && this.variants.length > 0;
});

// ── Indexes ─────────────────────────────────────────────────────
marketplaceListingSchema.index({ category: 1, active: 1 });
marketplaceListingSchema.index({ brand: 1 });
marketplaceListingSchema.index({ condition: 1 });
marketplaceListingSchema.index({ active: 1, verified: 1 });
marketplaceListingSchema.index({ price: 1 });
marketplaceListingSchema.index({ createdAt: -1 });
marketplaceListingSchema.index({ views: -1 });
marketplaceListingSchema.index({ libraryDevice: 1 });
marketplaceListingSchema.index({ listedBy: 1, createdAt: -1 });
// Cursor pagination support (_id descending)
marketplaceListingSchema.index({ _id: -1 });
// Full-text search
marketplaceListingSchema.index({
  name: "text",
  shortDescription: "text",
  brand: "text",
});

module.exports = mongoose.model("MarketplaceListing", marketplaceListingSchema);
