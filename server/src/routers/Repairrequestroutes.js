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

// ── Public ────────────────────────────────────────────────────
router.post("/", submitRequest); // Customer submits repair request
router.get("/:id", getRequestById); // Confirmation page fetch

// ── Admin ─────────────────────────────────────────────────────
router.get("/", protect, adminOnly, getAllRequests);
router.get("/stats", protect, adminOnly, getStats);
router.patch("/:id/assign", protect, adminOnly, assignRequest);
router.patch("/:id/status", protect, adminOnly, updateStatus);
router.delete("/:id", protect, adminOnly, deleteRequest);

module.exports = router;
