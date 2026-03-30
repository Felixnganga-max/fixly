const mongoose = require("mongoose");

// ── Commission rates ──────────────────────────────────────────
const RATES = {
  repair: 0.09, // 9%   — auto-triggered when repair → Completed
  sale: 0.045, // 4.5% — auto-triggered when purchase → completed
};

const commissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["repair", "sale"],
      required: true,
    },

    // ── Repair fields ─────────────────────────────────────
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      default: null,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      default: null,
    },

    // ── Sale fields ───────────────────────────────────────
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      default: null,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceListing",
      default: null,
    },

    // ── Shared ────────────────────────────────────────────
    basePrice: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    paidAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// @param {number} price
// @param {"repair"|"sale"} type
commissionSchema.statics.calculateAmount = function (price, type = "repair") {
  const rate = RATES[type] ?? RATES.repair;
  return Math.round(price * rate);
};

commissionSchema.statics.getRates = function () {
  return {
    repair: { rate: RATES.repair, percent: "9%" },
    sale: { rate: RATES.sale, percent: "4.5%" },
  };
};

commissionSchema.index({ status: 1 });
commissionSchema.index({ type: 1 });
commissionSchema.index({ technician: 1 });
commissionSchema.index({ createdAt: -1 });
commissionSchema.index({ job: 1 }, { sparse: true, unique: true });
commissionSchema.index({ purchase: 1 }, { sparse: true, unique: true });

module.exports = mongoose.model("Commission", commissionSchema);
