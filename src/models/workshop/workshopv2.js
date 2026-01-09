const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    original: {
      type: Number,
      required: true,
    },
    introductory: {
      type: Number,
      required: true,
    },
    monthly: {
      type: Number,
    },
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true, // IK, HS, KK
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true, // image URL or file path
    },
  },
  { _id: false }
);

const moduleSessionSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
    },
    totalSessions: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true, // Instant Buddy, Quarter Buddy, Buddy 6, Buddy 12
    },
    age: {
      type: String,
      required: true, // "6-12"
    },
    duration: {
      type: String,
      required: true, // "1 Month", "3 Months", "6 Months", "1 Year"
    },
    durationMonths: {
      type: Number,
      required: true, // 1, 3, 6, 12
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

    /* Buddy Camp logic */
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
  },
  { _id: false }
);

/* ---------- Workshop Schema ---------- */
const workshopV2Schema = new mongoose.Schema(
  {
    workshopCode: {
      type: String,
      unique: true,
      required: true, // WS_BUDDY_CAMP
    },
    name: {
      type: String,
      required: true, // Buddy Camp
    },
    description: {
      type: String,
    },
    modules: {
      type: [moduleSchema],
      required: true,
    },
    plans: {
      type: [planSchema],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WorkshopV2", workshopV2Schema);
