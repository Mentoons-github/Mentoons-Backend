const mongoose = require("mongoose");

const userPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    paymentType: {
      type: String,
      enum: ["FULL", "EMI"],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    emiDetails: {
      downPayment: Number,
      paidDownPayment: {
        type: Boolean,
        default: false,
      },
      emiAmount: Number,
      totalMonths: Number,
      paidMonths: { type: Number, default: 0 },
      nextDueDate: Date,
      status: {
        type: String,
        enum: ["active", "completed", "defaulted"],
        default: "active",
      },
    },

    accessStatus: {
      type: String,
      enum: ["active", "suspended", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserPlan", userPlanSchema);
