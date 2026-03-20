const express = require("express");
const router = express.Router();
const {
  getAllTechnicians,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  updateAvailability,
  deleteTechnician,
} = require("../controllers/Techniciancontroller");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getAllTechnicians); // Public — verified techs for display
router.get("/:id", protect, adminOnly, getTechnicianById);
router.post("/", protect, adminOnly, createTechnician);
router.put("/:id", protect, adminOnly, updateTechnician);
router.patch("/:id/availability", protect, adminOnly, updateAvailability);
router.delete("/:id", protect, adminOnly, deleteTechnician);

module.exports = router;
