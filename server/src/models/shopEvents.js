// models/shopEvents.js
const mongoose = require("mongoose");

const shopEventSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "ShopOwner", required: true },
    type: {
      type: String,
      enum: ["page_view", "product_view", "whatsapp_click", "call_click", "contact_reveal"],
      required: true,
    },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "MarketplaceListing", default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    visitorId: { type: String, default: "" }, // anonymous browser id (not personal data)
    referrer: { type: String, default: "", maxlength: 100 }, // google.com, direct, ...
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

shopEventSchema.index({ shop: 1, type: 1, createdAt: -1 });
shopEventSchema.index({ createdAt: -1 });
shopEventSchema.index({ shop: 1, visitorId: 1, type: 1, createdAt: -1 }); // de-dupe lookups

module.exports = mongoose.model("ShopEvent", shopEventSchema);