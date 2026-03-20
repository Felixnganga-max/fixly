const mongoose = require("mongoose");

// ── Flat-tier commission structure ───────────────────────────
// Matches the TIERS table in Commissions.jsx and the MVP doc.
// Change values here to update the entire system.
const COMMISSION_TIERS = [
  { min: 0, max: 2000, amount: 200 },
  { min: 2001, max: 5000, amount: 500 },
  { min: 5001, max: 10000, amount: 1000 },
  { min: 10001, max: null, amount: 1500 }, // null max = 10001+
];

const commissionSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairRequest",
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    repairPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    paidAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// Static — calculate commission amount from repair price
commissionSchema.statics.calculateAmount = function (repairPrice) {
  const tier = COMMISSION_TIERS.find(
    (t) => repairPrice >= t.min && (t.max === null || repairPrice <= t.max),
  );
  return tier ? tier.amount : 1500;
};

// Static — expose tiers for frontend display
commissionSchema.statics.getTiers = function () {
  return COMMISSION_TIERS;
};

commissionSchema.index({ status: 1 });
commissionSchema.index({ technician: 1 });
commissionSchema.index({ job: 1 }, { unique: true }); // one commission per job
commissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Commission", commissionSchema);
