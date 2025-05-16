const express = require("express");
const {
  getUserRewards,
  addPoints,
  redeemReward,
  getRewardHistory,
  getAvailableRewards,
  getRedemptionHistory,
} = require("../controllers/rewardController");
const { conditionalAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// All routes are protected and require authentication
router.use(conditionalAuth);

// User reward routes
router.get("/user-rewards", getUserRewards);
router.post("/add-points", addPoints);
router.post("/redeem", redeemReward);
router.get("/history", getRewardHistory);
router.get("/available-rewards", getAvailableRewards);
router.get("/redemptions", getRedemptionHistory);

module.exports = router;
