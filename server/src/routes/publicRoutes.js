// routes/publicRoutes.js
const express = require("express");
const { getPublicShop, listPublicShops, sitemap } = require("../controllers/publicShopController");

const router = express.Router();

router.get("/sitemap.xml", sitemap);
router.get("/shops", listPublicShops); // must come before /shops/:slug
router.get("/shops/:slug", getPublicShop);

module.exports = router;