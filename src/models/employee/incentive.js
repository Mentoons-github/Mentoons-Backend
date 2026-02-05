const mongoose = require("mongoose");

const incentiveLedger = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    sourceType: {
      type: String,
      enum: ["WORKSHOP_BATCH", "SESSION"],
      required: true,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    totalIncentiveAmount: {
      type: Number,
      required: true,
    },

    initialPaymentAmount: {
      type: Number,
      required: true,
    },

    finalPaymentAmount: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING",
    },

    initialPaymentDate: {
      type: Date,
    },

    finalPaymentDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("incentive", incentiveLedger);
