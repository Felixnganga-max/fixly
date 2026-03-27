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
router.get("/:id", getRequestById);

// ── Admin ───────────────────────────────────────────────────
// IMPORTANT: /stats must come BEFORE /:id or Express swallows it
router.get("/stats", protect, adminOnly, getStats); // ← moved up
router.get("/", protect, adminOnly, getAllRequests);
router.patch("/:id/assign", protect, adminOnly, assignRequest);
router.patch("/:id/status", protect, adminOnly, updateStatus);
router.delete("/:id", protect, adminOnly, deleteRequest);

module.exports = router;
