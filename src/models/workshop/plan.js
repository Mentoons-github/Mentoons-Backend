const mongoose = require("mongoose");

/* ---------- Price Schema ---------- */
const priceSchema = new mongoose.Schema(
  {
    original: { type: Number, required: true },
    introductory: { type: Number, required: true },
    monthly: { type: Number },
  },
  { _id: false }
);

const moduleSessionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    sessionCount: Number,
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    age: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true, // "1 Month", "3 Months"
    },

    durationMonths: {
      type: Number,
      required: true, 
    },

    mode: {
      type: [String],
      enum: ["Online", "Offline"],
      required: true,
    },

    totalSession: {
      type: Number,
      required: true,
    },

    price: {
      type: priceSchema,
      required: true,
    },

    emi: {
      enabled: {
        type: Boolean,
        default: false,
      },
      downPayment: Number,
      durationMonths: Number,
      monthlyAmount: Number,
      interestRate: {
        type: Number,
        default: 0,
      },
    },

    features: {
      type: [String],
      required: true,
    },

    paymentOption: {
      type: String,
      enum: ["fullPayment", "twoStep", "emi"],
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    materials: {
      type: String,
      required: true,
    },

    includesIntroSession: {
      type: Boolean,
      default: false,
    },

    includesFinalSession: {
      type: Boolean,
      default: false,
    },

    moduleSessions: {
      type: [moduleSessionSchema],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
