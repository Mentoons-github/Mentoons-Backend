const express = require("express");
const { verifyAdmin } = require("../../middlewares/admin/adminAuth");
const {
  getRevenueSummary,
  getRevenueOrdersByCategory,
} = require("../../controllers/admin/revenue");
const router = express.Router();

router.get("/summary", verifyAdmin, getRevenueSummary);
router.get("/orders", verifyAdmin, getRevenueOrdersByCategory);

module.exports = router;
