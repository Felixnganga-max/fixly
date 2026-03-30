const express = require("express");
const router = express.Router();

const {
  getAllRequests,
  getRequestById,
  updateRequest,
  assignShop,
  unassignShop,
  deleteRequest,
} = require("../controllers/purchaseController");

// All routes here are admin-protected — apply your auth middleware as needed
router.get("/", getAllRequests);
router.get("/:id", getRequestById);
router.patch("/:id", updateRequest);
router.patch("/:id/assign-shop", assignShop);
router.patch("/:id/unassign-shop", unassignShop);
router.delete("/:id", deleteRequest);

module.exports = router;
