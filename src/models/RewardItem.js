const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for redeemable rewards
const rewardItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availableQuantity: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    minimumTier: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      default: "bronze",
    },
    expiryDate: {
      type: Date,
    },
    redemptionCount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RewardItem", rewardItemSchema);
