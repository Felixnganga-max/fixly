const express = require("express");
const router = express.Router();
const {
  submitRequest,
  getRequestById,
  getAllRequests,
  assignRequest,
  updateStatus,
  getStats,
  deleteRequest,
} = require("../controllers/Repairrequestcontroller");
const { protect, adminOnly } = require("../middleware/auth");

// ── Public ─────────────────────────────────────────────────
router.post("/", submitRequest);

// ── Admin — /stats MUST come before /:id ───────────────────
router.get("/stats", protect, adminOnly, getStats);
router.get("/", protect, adminOnly, getAllRequests);
router.get("/:id", getRequestById); // public, after /stats
router.patch("/:id/assign", protect, adminOnly, assignRequest);
router.patch("/:id/status", protect, adminOnly, updateStatus);
router.delete("/:id", protect, adminOnly, deleteRequest);

module.exports = router;
