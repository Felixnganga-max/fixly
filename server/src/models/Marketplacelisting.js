const mongoose = require("mongoose");

const marketplaceListingSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["phone", "laptop"], required: true },
    brand: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },
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

    // Flexible spec object — keys match PHONE_SPEC_GROUPS / LAPTOP_SPEC_GROUPS
    // from productAssets.js on the frontend
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Optional: which shop owner listed this device
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOwner",
      default: null,
    },

    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual — discount percentage
marketplaceListingSchema.virtual("discount").get(function () {
  if (this.oldPrice && this.oldPrice > this.price) {
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }
  return null;
});

marketplaceListingSchema.index({ category: 1 });
marketplaceListingSchema.index({ brand: 1 });
marketplaceListingSchema.index({ condition: 1 });
marketplaceListingSchema.index({ active: 1, verified: 1 });
marketplaceListingSchema.index({ price: 1 });
marketplaceListingSchema.index({ createdAt: -1 });
marketplaceListingSchema.index({
  name: "text",
  shortDescription: "text",
  brand: "text",
});

module.exports = mongoose.model("MarketplaceListing", marketplaceListingSchema);
