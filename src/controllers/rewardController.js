const Reward = require("../models/Reward");
const RewardItem = require("../models/RewardItem");
const RewardRedemption = require("../models/RewardRedemption");
const {
  POINTS_CONFIG,
  TIER_BENEFITS,
  TIER_THRESHOLDS,
} = require("../config/rewardConfig");

/**
 * Get rewards for a specific user
 */
const getUserRewards = async (req, res) => {
  try {
    const userId = req.user.dbUser._id; // Assuming auth middleware attaches user to req

    // Find or create the user's reward document
    let userReward = await Reward.findOne({ userId });

    if (!userReward) {
      userReward = new Reward({
        userId,
        totalPoints: 0,
        currentTier: "bronze",
        transactions: [],
      });
      await userReward.save();
    }

    // Get available rewards based on user's tier
    const availableRewards = await RewardItem.find({
      isActive: true,
      minimumTier: { $in: ["bronze", userReward.currentTier] },
      $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
    });

    // Calculate points to next tier
    const pointsToNextTier = userReward.calculatePointsToNextTier();

    return res.status(200).json({
      totalPoints: userReward.totalPoints,
      currentTier: userReward.currentTier,
      pointsToNextTier,
      transactions: userReward.transactions,
      availableRewards,
      tierBenefits: TIER_BENEFITS[userReward.currentTier],
    });
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    return res
      .status(500)
      .json({ message: "Error fetching rewards", error: error.message });
  }
};

const addPoints = async (req, res) => {
  try {
    const { eventType, reference, description } = req.body;
    const userId = req.user.dbUser._id; // Ensure this is correct and matches schema

    // Validate event type
    if (!POINTS_CONFIG[eventType]) {
      return res.status(400).json({ message: "Invalid event type" });
    }

    const points = POINTS_CONFIG[eventType];

    // Atomically find or create user reward
    let userReward = await Reward.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          totalPoints: 0,
          transactions: [],
          dailyLoginCount: 0,
        },
      },
      { new: true, upsert: true }
    );

    // Ensure default fields exist in case document was just created
    if (!userReward.transactions) userReward.transactions = [];
    if (!userReward.totalPoints) userReward.totalPoints = 0;
    if (!userReward.dailyLoginCount) userReward.dailyLoginCount = 0;

    // Check for daily login special case
    if (eventType === "daily_login") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (userReward.lastLogin && userReward.lastLogin >= today) {
        return res
          .status(400)
          .json({ message: "Daily login reward already claimed today" });
      }

      userReward.lastLogin = new Date();
      userReward.dailyLoginCount += 1;
    }

    // Check if any transaction with this reference exists (regardless of event type)
    const existingTransactionIndex = userReward.transactions.findIndex(
      (transaction) => transaction.reference === reference
    );

    if (existingTransactionIndex !== -1) {
      const existingTransaction =
        userReward.transactions[existingTransactionIndex];

      // If the same event type, don't allow points again
      if (existingTransaction.eventType === eventType) {
        return res.status(400).json({
          message: "Points for this action have already been awarded",
        });
      }

      // If different event type, update the existing transaction instead of creating new one
      // First, deduct the old points
      userReward.totalPoints -= existingTransaction.points;

      // Update the transaction with new event type and points
      existingTransaction.eventType = eventType;
      existingTransaction.points = points;
      existingTransaction.description =
        description ||
        `Updated to ${points} points for ${eventType.replace(/_/g, " ")}`;
      existingTransaction.updatedAt = new Date();

      // Add the new points
      userReward.totalPoints += points;

      // Save the updated document
      await userReward.save();

      return res.status(200).json({
        message: "Action type updated for this content",
        totalPoints: userReward.totalPoints,
        currentTier: userReward.currentTier,
        pointsToNextTier: userReward.calculatePointsToNextTier(),
        updatedTransaction: existingTransaction,
      });
    }

    // Create transaction entry for new reference
    const newTransaction = {
      eventType,
      points,
      description:
        description ||
        `Earned ${points} points for ${eventType.replace(/_/g, " ")}`,
      reference,
      createdAt: new Date(),
    };

    // Update user reward data
    userReward.transactions.unshift(newTransaction);
    userReward.totalPoints += points;

    // Save reward data
    await userReward.save();

    // Compute tier info
    const pointsToNextTier = userReward.calculatePointsToNextTier();

    return res.status(200).json({
      totalPoints: userReward.totalPoints,
      currentTier: userReward.currentTier,
      pointsToNextTier,
      newTransaction,
    });
  } catch (error) {
    console.error("Error adding reward points:", error);
    return res
      .status(500)
      .json({ message: "Error adding reward points", error: error.message });
  }
};

/**
 * Redeem a reward
 */
const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const userId = req.user._id; // Assuming auth middleware attaches user to req

    // Find the reward item
    const rewardItem = await RewardItem.findById(rewardId);
    if (!rewardItem) {
      return res.status(404).json({ message: "Reward not found" });
    }

    // Check if reward is active
    if (!rewardItem.isActive) {
      return res
        .status(400)
        .json({ message: "This reward is not currently available" });
    }

    // Check if quantity is available
    if (rewardItem.availableQuantity === 0) {
      return res.status(400).json({ message: "This reward is out of stock" });
    }

    // Find user's reward document
    const userReward = await Reward.findOne({ userId });
    if (!userReward) {
      return res.status(404).json({ message: "User reward profile not found" });
    }

    // Check if user has enough points
    if (userReward.totalPoints < rewardItem.pointsRequired) {
      return res.status(400).json({
        message: "Not enough points",
        required: rewardItem.pointsRequired,
        available: userReward.totalPoints,
      });
    }

    // Check if user meets minimum tier requirement
    const tierRank = {
      bronze: 1,
      silver: 2,
      gold: 3,
    };

    if (tierRank[userReward.currentTier] < tierRank[rewardItem.minimumTier]) {
      return res.status(400).json({
        message: `This reward requires ${rewardItem.minimumTier} tier or higher`,
      });
    }

    // Create redemption record
    const redemption = new RewardRedemption({
      userId,
      rewardItemId: rewardId,
      pointsSpent: rewardItem.pointsRequired,
      status: "pending",
      couponCode: rewardItem.couponCode,
      expiryDate: rewardItem.expiryDate,
    });

    // Update user points
    userReward.totalPoints -= rewardItem.pointsRequired;

    // Add transaction record
    userReward.transactions.unshift({
      eventType: "redemption",
      points: -rewardItem.pointsRequired,
      description: `Redeemed ${rewardItem.name} for ${rewardItem.pointsRequired} points`,
      reference: rewardId,
      createdAt: new Date(),
    });

    // Update reward item inventory
    if (rewardItem.availableQuantity > 0) {
      rewardItem.availableQuantity -= 1;
    }
    rewardItem.redemptionCount += 1;

    // Save all updates
    await Promise.all([
      userReward.save(),
      redemption.save(),
      rewardItem.save(),
    ]);

    return res.status(200).json({
      message: "Reward redeemed successfully",
      remainingPoints: userReward.totalPoints,
      redemption,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return res
      .status(500)
      .json({ message: "Error redeeming reward", error: error.message });
  }
};

/**
 * Get user's reward history
 */
const getRewardHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find user's reward
    const userReward = await Reward.findOne({ userId });
    if (!userReward) {
      return res.status(404).json({ message: "User reward profile not found" });
    }

    // Get total count for pagination
    const totalTransactions = userReward.transactions.length;

    // Return paginated transactions
    const transactions = userReward.transactions.slice(skip, skip + limit);

    return res.status(200).json({
      transactions,
      pagination: {
        totalItems: totalTransactions,
        totalPages: Math.ceil(totalTransactions / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching reward history:", error);
    return res
      .status(500)
      .json({ message: "Error fetching reward history", error: error.message });
  }
};

/**
 * Get available rewards for user
 */
const getAvailableRewards = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user's reward to get their tier
    const userReward = await Reward.findOne({ userId });
    if (!userReward) {
      return res.status(404).json({ message: "User reward profile not found" });
    }

    // Get available rewards based on user's tier
    const rewards = await RewardItem.find({
      isActive: true,
      minimumTier: { $in: ["bronze", userReward.currentTier] },
      $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
    });

    return res.status(200).json({
      rewards,
      userPoints: userReward.totalPoints,
      userTier: userReward.currentTier,
    });
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return res.status(500).json({
      message: "Error fetching available rewards",
      error: error.message,
    });
  }
};

/**
 * Get user's redemption history
 */
const getRedemptionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Find redemptions with populated reward details
    const redemptions = await RewardRedemption.find({ userId })
      .populate("rewardItemId", "name description imageUrl pointsRequired")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination
    const total = await RewardRedemption.countDocuments({ userId });

    return res.status(200).json({
      redemptions,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching redemption history:", error);
    return res.status(500).json({
      message: "Error fetching redemption history",
      error: error.message,
    });
  }
};

module.exports = {
  getUserRewards,
  addPoints,
  redeemReward,
  getRewardHistory,
  getAvailableRewards,
  getRedemptionHistory,
};
