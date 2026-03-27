const express = require("express");
const router = express.Router();
const {
  getAllShopOwners,
  getShopOwnerById,
  createShopOwner,
  updateShopOwner,
  toggleVerified,
  toggleActive,
  deleteShopOwner,
} = require("../controllers/Shopownercontroller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", protect, adminOnly, getAllShopOwners);
router.get("/:id", protect, adminOnly, getShopOwnerById);
router.post("/", protect, adminOnly, createShopOwner);
router.put("/:id", protect, adminOnly, updateShopOwner);
router.patch("/:id/verify", protect, adminOnly, toggleVerified);
router.patch("/:id/active", protect, adminOnly, toggleActive);
router.delete("/:id", protect, adminOnly, deleteShopOwner);

module.exports = router;
