const express = require("express");
const router = express.Router();
const {
  getAllListings,
  getListingById,
  getMyListings,
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
const { protect, shopOnly, staffOnly } = require("../middleware/auth");

// ── Public ────────────────────────────────────────────────────
router.get("/", cacheMiddleware(60), getAllListings);
router.get("/stats", cacheMiddleware(300), getStats);

// ── Shop owner (above "/:id") — not cached ────────────────────
router.get("/mine", protect, shopOnly, getMyListings);

router.get("/:id", getListingById);

// ── Price alerts (unchanged) ──────────────────────────────────
// NOTE: these have no auth today. Add customer auth or rate limiting later.
router.post("/:id/alert", createAlert);
router.delete("/:id/alert", deleteAlert);

// ── Writes: admin OR shop owner. protect runs BEFORE upload so
// anonymous requests never reach Cloudinary. Ownership is enforced
// inside the controller.
router.post("/", protect, staffOnly, uploadProductImages, createListing);
router.put("/:id", protect, staffOnly, uploadProductImages, updateListing);
router.delete("/:id/image", protect, staffOnly, deleteImage);
router.patch("/:id/toggle-active", protect, staffOnly, toggleActive);
router.delete("/:id", protect, staffOnly, deleteListing);

module.exports = router;