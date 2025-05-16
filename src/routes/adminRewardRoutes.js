const express = require("express");
const {
  createRewardItem,
  getAllRewardItems,
  updateRewardItem,
  deleteRewardItem,
  getAllRedemptions,
  updateRedemptionStatus,
  getUserRewardStats,
  adjustUserPoints,
} = require("../controllers/adminRewardController");
const {
  conditionalAuth,
  restrictTo,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// All admin routes require authentication and admin/super-admin role
router.use(conditionalAuth);
//add Role check
router.use(restrictTo("ADMIN", "SUPER-ADMIN"));

// Reward item management
router.post("/items", createRewardItem);
router.get("/items", getAllRewardItems);
router.patch("/items/:id", updateRewardItem);
router.delete("/items/:id", deleteRewardItem);

// Redemption management
router.get("/redemptions", getAllRedemptions);
router.patch("/redemptions/:id/status", updateRedemptionStatus);

// User reward management
router.post("/users/adjust-points", adjustUserPoints);

// Statistics
router.get("/stats", getUserRewardStats);

module.exports = router;
