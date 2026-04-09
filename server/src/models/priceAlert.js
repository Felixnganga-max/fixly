const mongoose = require("mongoose");

const priceAlertSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceListing",
      required: true,
    },
    // userId — reference your existing user/shop-owner model here
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOwner",
      required: true,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    targetPrice: { type: Number, required: true, min: 0 },
    notified: { type: Boolean, default: false },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

priceAlertSchema.index({ listingId: 1, notified: 1 });
priceAlertSchema.index({ userId: 1 });
// Prevent duplicate alert from same user on same listing
priceAlertSchema.index({ listingId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("PriceAlert", priceAlertSchema);
