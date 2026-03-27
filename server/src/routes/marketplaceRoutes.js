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

const { createPurchaseRequest } = require("../controllers/purchaseController");

const { uploadProductImages } = require("../config/cloudinary");

// ── Public ─────────────────────────────────────────────────────────────────
router.get("/", getAllListings);
router.get("/stats", getStats); // keep above /:id
router.get("/:id", getListingById);

// Buy Now — submit a purchase request for a listing
router.post("/:id/buy", createPurchaseRequest);

// ── Admin / Protected ──────────────────────────────────────────────────────
// Attach uploadProductImages middleware to handle multipart/form-data with images
router.post("/", uploadProductImages, createListing);
router.put("/:id", uploadProductImages, updateListing);
router.delete("/:id/image", deleteImage);
router.patch("/:id/toggle-active", toggleActive);
router.delete("/:id", deleteListing);

module.exports = router;
