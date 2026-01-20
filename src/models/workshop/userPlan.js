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

    selectedMode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },

    bplApplied: {
      type: Boolean,
      default: false,
    },

    bplCardFile: {
      type: String,
    },
    bplStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
        enum: ["active", "completed", "defaulted", "initiated", "aborted"],
        default: "active",
      },
    },

    accessStatus: {
      type: String,
      enum: ["active", "suspended", "expired", "initiated"],
      default: "initiated",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UserPlan", userPlanSchema);
