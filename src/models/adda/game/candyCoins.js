const mongoose = require("mongoose");

const candyCoinsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
    },
    currentCoins: {
      type: Number,
      default: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
    },
    history: [
      {
        type: {
          type: String,
          enum: ["earn", "spend"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const CandyCoins = mongoose.model("candyCoin", candyCoinsSchema);

module.exports = CandyCoins;
