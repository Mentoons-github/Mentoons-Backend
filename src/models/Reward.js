const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define reward tiers
const REWARD_TIERS = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
};

// Transaction schema for point history
const transactionSchema = new Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      "daily_login",
      "registration",
      "profile_completion",
      "like_post",
      "comment_post",
      "share_post",
      "create_status",
      "join_group",
      "follow_user",
      "purchase_product",
      "share_product",
      "book_session",
      "apply_job",
      "listen_audio_comic",
      "listen_podcast",
      "read_comic",
    ],
  },
  points: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  reference: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main Reward schema
const rewardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    currentTier: {
      type: String,
      enum: Object.values(REWARD_TIERS),
      default: REWARD_TIERS.BRONZE,
    },
    transactions: [transactionSchema],
    dailyLoginCount: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    lastPointsUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Method to calculate current tier based on points
rewardSchema.methods.calculateTier = function () {
  const points = this.totalPoints;

  if (points >= 1500) {
    return REWARD_TIERS.GOLD;
  } else if (points >= 500) {
    return REWARD_TIERS.SILVER;
  } else {
    return REWARD_TIERS.BRONZE;
  }
};

// Method to calculate points needed for next tier
rewardSchema.methods.calculatePointsToNextTier = function () {
  const points = this.totalPoints;
  const currentTier = this.currentTier;

  if (currentTier === REWARD_TIERS.GOLD) {
    return 0; // Already at highest tier
  } else if (currentTier === REWARD_TIERS.SILVER) {
    return 1500 - points; // Points needed for Gold
  } else {
    return 500 - points; // Points needed for Silver
  }
};

// Pre-save middleware to ensure tier is updated
rewardSchema.pre("save", function (next) {
  if (this.isModified("totalPoints")) {
    this.currentTier = this.calculateTier();
  }
  next();
});

module.exports = mongoose.model("Reward", rewardSchema);
