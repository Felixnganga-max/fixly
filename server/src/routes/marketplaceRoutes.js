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
const {
  createAlert,
  deleteAlert,
  getMyAlerts,
} = require("../controllers/priceAlerts");
const { cacheMiddleware } = require("../utils/cache");

// Swap these for your actual auth middleware:
const { protect, adminOnly } = require("../middleware/auth");
const { uploadProductImages } = require("../middleware/upload");

// ── Public ──────────────────────────────────────────────────────

// Cached for 60s — busted on any write
router.get("/", cacheMiddleware(60), getAllListings);

// Stats cached for 5 minutes
router.get("/stats", cacheMiddleware(300), getStats);

// Single listing — NOT cached (view count must fire, and data changes often)
router.get("/:id", getListingById);

// ── Private (logged-in users) ────────────────────────────────────
// router.use(protect);

// Price alerts
router.post("/:id/alert", /* protect, */ createAlert);
router.delete("/:id/alert", /* protect, */ deleteAlert);

// ── Admin ────────────────────────────────────────────────────────
// router.use(adminOnly);

router.post("/", /* uploadProductImages, */ createListing);
router.put("/:id", /* uploadProductImages, */ updateListing);
router.delete("/:id/image", deleteImage);
router.patch("/:id/toggle-active", toggleActive);
router.delete("/:id", deleteListing);

module.exports = router;
