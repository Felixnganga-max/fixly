const express = require("express");
const router = express.Router();
const { getMyAlerts } = require("../controllers/priceAlerts");

// const { protect } = require("../middleware/auth");

// GET /api/alerts/mine  — all alerts for the logged-in user
router.get("/mine", /* protect, */ getMyAlerts);

module.exports = router;
