const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for tracking reward redemptions
const redemptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rewardItemId: {
      type: Schema.Types.ObjectId,
      ref: "RewardItem",
      required: true,
    },
    pointsSpent: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "canceled", "expired"],
      default: "pending",
    },
    couponCode: {
      type: String,
    },
    fulfillmentDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index to efficiently query user redemptions
redemptionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("RewardRedemption", redemptionSchema);
