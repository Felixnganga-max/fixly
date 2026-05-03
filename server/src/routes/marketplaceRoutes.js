const express = require("express");
const router = express.Router();
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteImage,
  toggleActive,
  deleteListing,
  getStats,
} = require("../controllers/Marketplacecontroller");
const { createAlert, deleteAlert } = require("../controllers/priceAlerts");
const { cacheMiddleware } = require("../utils/cache");
const { uploadProductImages } = require("../utils/upload");

// ── Public ────────────────────────────────────────────────────

// Cached for 60s — busted on any write
router.get("/", cacheMiddleware(60), getAllListings);

// Stats cached for 5 minutes
router.get("/stats", cacheMiddleware(300), getStats);

// Single listing — NOT cached (view count must fire)
router.get("/:id", getListingById);

// ── Private (logged-in users) ─────────────────────────────────
// Price alerts
router.post("/:id/alert", createAlert);
router.delete("/:id/alert", deleteAlert);

// ── Admin ──────────────────────────────────────────────────────
router.post("/", uploadProductImages, createListing);
router.put("/:id", uploadProductImages, updateListing);
router.delete("/:id/image", deleteImage);
router.patch("/:id/toggle-active", toggleActive);
router.delete("/:id", deleteListing);

module.exports = router;
