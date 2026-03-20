const mongoose = require("mongoose");

const shopOwnerSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    phone: { type: String, required: [true, "Phone is required"], trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // A shop can handle phones, laptops, or both
    category: {
      type: [String],
      enum: ["phone", "laptop"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "At least one category (phone or laptop) is required",
      },
    },

    description: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

shopOwnerSchema.index({ verified: 1 });
shopOwnerSchema.index({ active: 1 });
shopOwnerSchema.index({ category: 1 });

module.exports = mongoose.model("ShopOwner", shopOwnerSchema);
