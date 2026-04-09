const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // category: which tab this brand appears under. "all" means both.
    category: {
      type: String,
      enum: ["phone", "laptop", "all"],
      default: "all",
    },
    logo: { type: String, default: null }, // Cloudinary URL
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }, // for manual ordering in the UI
  },
  { timestamps: true }
);

// Compound index: quickly fetch all active brands for a category
brandSchema.index({ category: 1, active: 1, sortOrder: 1 });
brandSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Brand", brandSchema);