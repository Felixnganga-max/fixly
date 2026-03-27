const mongoose = require("mongoose");

const purchaseRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceListing",
      required: true,
    },
    // Snapshot of listing at time of request (in case listing changes/gets deleted)
    listingSnapshot: {
      name: String,
      brand: String,
      category: String,
      price: Number,
      condition: String,
      image: String, // first image
    },
    // Buyer info
    firstName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s\-]{7,15}$/, "Please enter a valid phone number"],
    },
    address: { type: String, required: true, trim: true },

    // Optional delivery preference
    deliveryMethod: {
      type: String,
      enum: ["delivery", "pickup", "undecided"],
      default: "undecided",
    },

    // Status tracking
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: "" }, // admin notes
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

purchaseRequestSchema.index({ listing: 1 });
purchaseRequestSchema.index({ status: 1 });
purchaseRequestSchema.index({ email: 1 });
purchaseRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PurchaseRequest", purchaseRequestSchema);
