const express = require("express");
const router = express.Router();
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  toggleActive,
  deleteListing,
  getStats,
} = require("../controllers/Marketplacecontroller");
const { protect, adminOnly } = require("../middleware/auth");

// Static routes before :id wildcard
router.get("/stats", protect, adminOnly, getStats);
router.get("/", getAllListings); // Public
router.get("/:id", getListingById); // Public
router.post("/", protect, adminOnly, createListing);
router.put("/:id", protect, adminOnly, updateListing);
router.patch("/:id/toggle-active", protect, adminOnly, toggleActive);
router.delete("/:id", protect, adminOnly, deleteListing);

module.exports = router;
