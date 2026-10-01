const express = require("express");
const router = express.Router();
const {
  getAllShopOwners,
  getShopOwnerById,
  createShopOwner,
  updateShopOwner,
  toggleVerified,
  toggleActive,
  resetPassword,
  deleteShopOwner,
  getMyShop,
  updateMyShop,
} = require("../controllers/Shopownercontroller");
const { protect, adminOnly, shopOnly } = require("../middleware/auth");

// Self-service — must stay above "/:id"
router.get("/me", protect, shopOnly, getMyShop);
router.put("/me", protect, shopOnly, updateMyShop);

// Admin
router.get("/", protect, adminOnly, getAllShopOwners);
router.get("/:id", protect, adminOnly, getShopOwnerById);
router.post("/", protect, adminOnly, createShopOwner);
router.put("/:id", protect, adminOnly, updateShopOwner);
router.patch("/:id/verify", protect, adminOnly, toggleVerified);
router.patch("/:id/active", protect, adminOnly, toggleActive);
router.patch("/:id/reset-password", protect, adminOnly, resetPassword);
router.delete("/:id", protect, adminOnly, deleteShopOwner);

module.exports = router;
