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
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    incentiveAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("incentive", incentiveLedger);
