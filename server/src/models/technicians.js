const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    phone: { type: String, required: [true, "Phone is required"], trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    category: {
      type: String,
      enum: ["phone", "laptop"],
      required: [true, "Category is required"],
    },
    specializations: { type: [String], default: [] }, // e.g. ["Screen repair", "Battery replacement"]
    shopAddress: {
      type: String,
      required: [true, "Shop address is required"],
      trim: true,
    },
    shopOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOwner",
      default: null,
    },
    verified: { type: Boolean, default: false },
    availability: {
      type: String,
      enum: ["Available", "Busy", "Offline"],
      default: "Available",
    },
    jobsCompleted: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

technicianSchema.index({ category: 1, verified: 1, availability: 1 });

module.exports = mongoose.model("Technician", technicianSchema);
