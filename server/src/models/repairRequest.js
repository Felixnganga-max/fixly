const mongoose = require("mongoose");

const repairRequestSchema = new mongoose.Schema(
  {
    // ── Customer ────────────────────────────────────────────
    name: { type: String, required: [true, "Name is required"], trim: true },
    phone: { type: String, required: [true, "Phone is required"], trim: true },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // ── Device ──────────────────────────────────────────────
    deviceType: {
      type: String,
      enum: ["phone", "laptop"],
      required: [true, "Device type is required"],
    },
    deviceModel: { type: String, trim: true, default: "" }, // e.g. "HP ProBook 450 G8", "Samsung Galaxy S22"

    issueType: { type: String, trim: true, default: "" }, // e.g. "Cracked screen"
    issueDescription: { type: String, trim: true, default: "" }, // free-text from customer

    // ── Assignment ──────────────────────────────────────────
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      default: null,
    },
    assignedShop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOwner",
      default: null,
    },

    // ── Quote ───────────────────────────────────────────────
    estimatedPriceMin: { type: Number, default: null },
    estimatedPriceMax: { type: Number, default: null },
    estimatedTime: { type: String, default: null }, // e.g. "1–2 hours"

    // ── Status ──────────────────────────────────────────────
    // Pending → Assigned → InProgress → Completed | IssueReported
    status: {
      type: String,
      enum: ["Pending", "Assigned", "InProgress", "Completed", "IssueReported"],
      default: "Pending",
    },

    // ── Admin ───────────────────────────────────────────────
    adminNotes: { type: String, default: "" },
    customerNotified: { type: Boolean, default: false },
    technicianNotified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual — friendly price range string
repairRequestSchema.virtual("priceRange").get(function () {
  if (!this.estimatedPriceMin) return null;
  const max = this.estimatedPriceMax
    ? ` – KES ${this.estimatedPriceMax.toLocaleString()}`
    : "";
  return `KES ${this.estimatedPriceMin.toLocaleString()}${max}`;
});

repairRequestSchema.index({ status: 1 });
repairRequestSchema.index({ deviceType: 1 });
repairRequestSchema.index({ createdAt: -1 });
repairRequestSchema.index({ phone: 1 });

module.exports = mongoose.model("RepairRequest", repairRequestSchema);
