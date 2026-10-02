// models/customers.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }, // stored as 2547XXXXXXXX
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },

    // Promos only go to people who ticked the box
    marketingConsent: { type: Boolean, default: false },
    consentAt: { type: Date, default: null },

    // Shops whose number this customer has viewed (useful lead data)
    contactedShops: [{ type: mongoose.Schema.Types.ObjectId, ref: "ShopOwner" }],
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ marketingConsent: 1 });

module.exports = mongoose.model("Customer", customerSchema);