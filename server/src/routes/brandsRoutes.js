const express = require("express");
const router = express.Router();
const {
  getBrands,
  getAllBrandsAdmin,
  createBrand,
  updateBrand,
  deleteBrand,
  reorderBrands,
} = require("../controllers/brands");
const { cacheMiddleware } = require("../utils/cache");

// Swap these imports for your own auth middleware
// const { protect, adminOnly } = require("../middleware/auth");

// ── Public ──────────────────────────────────────────────────────
// GET /api/brands?category=phone|laptop
router.get("/", cacheMiddleware(120), getBrands);

// ── Admin ───────────────────────────────────────────────────────
// router.use(protect, adminOnly); // uncomment when auth is wired

router.get("/admin", getAllBrandsAdmin);
router.post("/", /* uploadBrandLogo, */ createBrand);
router.put("/:id", /* uploadBrandLogo, */ updateBrand);
router.delete("/:id", deleteBrand);
router.patch("/reorder", reorderBrands);

module.exports = router;
