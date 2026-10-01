// routes/publicRoutes.js
const express = require("express");
const { getPublicShop } = require("../controllers/publicShopController");

const router = express.Router();

// No auth middleware on purpose: these are for customers.
router.get("/shops/:slug", getPublicShop);

module.exports = router;