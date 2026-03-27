const express = require("express");
const router = express.Router();
const {
  getAllCommissions,
  createCommission,
  markPaid,
  getStats,
  deleteCommission,
} = require("../controllers/Commissioncontroller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/stats", protect, adminOnly, getStats);
router.get("/", protect, adminOnly, getAllCommissions);
router.post("/", protect, adminOnly, createCommission);
router.patch("/:id/pay", protect, adminOnly, markPaid);
router.delete("/:id", protect, adminOnly, deleteCommission);

module.exports = router;
