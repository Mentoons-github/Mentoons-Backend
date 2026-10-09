const mongoose = require("mongoose");

const AssessmentHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    assessmentTitle: { type: String, required: true },
    ageCategory: { type: String },
    score: { type: Number },
    totalQuestions: { type: Number },
    status: {
      type: String,
      enum: ["started", "completed"],
      default: "completed",
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

AssessmentHistorySchema.index({ user: 1, completedAt: -1 });
const AssessmentHistory = mongoose.model(
  "AssessmentHistory",
  AssessmentHistorySchema,
);

module.exports = AssessmentHistory;
