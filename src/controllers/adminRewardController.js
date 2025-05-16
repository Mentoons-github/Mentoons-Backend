const Reward = require("../models/Reward");
const RewardItem = require("../models/RewardItem");
const RewardRedemption = require("../models/RewardRedemption");

/**
 * Create a new reward item
 */
const createRewardItem = async (req, res) => {
  try {
    const {
      name,
      description,
      pointsRequired,
      imageUrl,
      availableQuantity,
      minimumTier,
      expiryDate,
      couponCode,
      discountPercentage,
      tags,
    } = req.body;

    // Validate required fields
    if (!name || !description || !pointsRequired) {
      return res.status(400).json({
        message: "Name, description, and pointsRequired are required fields",
      });
    }

    // Create new reward item
    const rewardItem = new RewardItem({
      name,
      description,
      pointsRequired,
      imageUrl,
      availableQuantity: availableQuantity || -1, // Default to unlimited
      minimumTier: minimumTier || "bronze",
      isActive: true,
      expiryDate: expiryDate || null,
      couponCode,
      discountPercentage,
      tags: tags || [],
    });

    await rewardItem.save();

    return res.status(201).json({
      message: "Reward item created successfully",
      reward: rewardItem,
    });
  } catch (error) {
    console.error("Error creating reward item:", error);
    return res
      .status(500)
      .json({ message: "Error creating reward item", error: error.message });
  }
};

/**
 * Get all reward items (with filtering options)
 */
const getAllRewardItems = async (req, res) => {
  try {
    const {
      active,
      minimumTier,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = {};
    if (active !== undefined) {
      query.isActive = active === "true";
    }
    if (minimumTier) {
      query.minimumTier = minimumTier;
    }

    // Count total items
    const total = await RewardItem.countDocuments(query);

    // Get paginated results
    const rewards = await RewardItem.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      rewards,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reward items:", error);
    return res
      .status(500)
      .json({ message: "Error fetching reward items", error: error.message });
  }
};

/**
 * Update a reward item
 */
const updateRewardItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find and update the reward item
    const rewardItem = await RewardItem.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!rewardItem) {
      return res.status(404).json({ message: "Reward item not found" });
    }

    return res.status(200).json({
      message: "Reward item updated successfully",
      reward: rewardItem,
    });
  } catch (error) {
    console.error("Error updating reward item:", error);
    return res
      .status(500)
      .json({ message: "Error updating reward item", error: error.message });
  }
};

/**
 * Delete a reward item
 */
const deleteRewardItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if reward item exists
    const rewardItem = await RewardItem.findById(id);
    if (!rewardItem) {
      return res.status(404).json({ message: "Reward item not found" });
    }

    // Check if any redemptions exist for this reward
    const redemptionExists = await RewardRedemption.exists({
      rewardItemId: id,
    });
    if (redemptionExists) {
      // Instead of hard delete, just deactivate the reward item
      rewardItem.isActive = false;
      await rewardItem.save();

      return res.status(200).json({
        message:
          "Reward item has redemptions. It has been deactivated instead of deleted.",
      });
    }

    // Perform hard delete if no redemptions
    await RewardItem.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Reward item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reward item:", error);
    return res
      .status(500)
      .json({ message: "Error deleting reward item", error: error.message });
  }
};

/**
 * Get a list of all redemptions with filtering options
 */
const getAllRedemptions = async (req, res) => {
  try {
    const {
      status,
      userId,
      rewardId,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = userId;
    }
    if (rewardId) {
      query.rewardItemId = rewardId;
    }

    // Count total redemptions
    const total = await RewardRedemption.countDocuments(query);

    // Get paginated results with population
    const redemptions = await RewardRedemption.find(query)
      .populate("userId", "name email")
      .populate("rewardItemId", "name description pointsRequired")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      redemptions,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return res
      .status(500)
      .json({ message: "Error fetching redemptions", error: error.message });
  }
};

/**
 * Update a redemption status
 */
const updateRedemptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    if (!["pending", "fulfilled", "canceled", "expired"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update the redemption
    const redemption = await RewardRedemption.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          notes: notes || redemption.notes,
          fulfillmentDate:
            status === "fulfilled" ? new Date() : redemption.fulfillmentDate,
        },
      },
      { new: true }
    );

    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }

    return res.status(200).json({
      message: "Redemption status updated successfully",
      redemption,
    });
  } catch (error) {
    console.error("Error updating redemption status:", error);
    return res.status(500).json({
      message: "Error updating redemption status",
      error: error.message,
    });
  }
};

/**
 * Get user reward statistics
 */
const getUserRewardStats = async (req, res) => {
  try {
    // Count users by tier
    const tierCounts = await Reward.aggregate([
      { $group: { _id: "$currentTier", count: { $sum: 1 } } },
    ]);

    // Convert to a more user-friendly format
    const tierStats = {};
    tierCounts.forEach((tier) => {
      tierStats[tier._id] = tier.count;
    });

    // Get total points awarded
    const totalPointsAggregation = await Reward.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPoints" } } },
    ]);
    const totalPointsAwarded =
      totalPointsAggregation.length > 0 ? totalPointsAggregation[0].total : 0;

    // Get most recent redemptions
    const recentRedemptions = await RewardRedemption.find()
      .populate("userId", "name email")
      .populate("rewardItemId", "name pointsRequired")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get most popular rewards (by redemption count)
    const popularRewards = await RewardItem.find()
      .sort({ redemptionCount: -1 })
      .limit(5);

    return res.status(200).json({
      tierStats,
      totalPointsAwarded,
      recentRedemptions,
      popularRewards,
    });
  } catch (error) {
    console.error("Error fetching reward statistics:", error);
    return res.status(500).json({
      message: "Error fetching reward statistics",
      error: error.message,
    });
  }
};

/**
 * Manually adjust user points
 */
const adjustUserPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    const adminId = req.user._id; // Assuming auth middleware attaches admin user

    if (!userId || !points) {
      return res.status(400).json({
        message: "User ID and points adjustment amount are required",
      });
    }

    // Find user reward
    let userReward = await Reward.findOne({ userId });
    if (!userReward) {
      userReward = new Reward({ userId, totalPoints: 0 });
    }

    // Create transaction record
    const transaction = {
      eventType: points >= 0 ? "manual_addition" : "manual_deduction",
      points,
      description:
        reason || `Manual ${points >= 0 ? "addition" : "deduction"} by admin`,
      reference: adminId.toString(),
      createdAt: new Date(),
    };

    // Update points
    userReward.totalPoints += points;
    userReward.transactions.unshift(transaction);

    // Ensure points don't go below zero
    if (userReward.totalPoints < 0) {
      userReward.totalPoints = 0;
    }

    await userReward.save();

    return res.status(200).json({
      message: "User points adjusted successfully",
      newTotalPoints: userReward.totalPoints,
      currentTier: userReward.currentTier,
      transaction,
    });
  } catch (error) {
    console.error("Error adjusting user points:", error);
    return res
      .status(500)
      .json({ message: "Error adjusting user points", error: error.message });
  }
};

module.exports = {
  createRewardItem,
  getAllRewardItems,
  updateRewardItem,
  deleteRewardItem,
  getAllRedemptions,
  updateRedemptionStatus,
  getUserRewardStats,
  adjustUserPoints,
};
