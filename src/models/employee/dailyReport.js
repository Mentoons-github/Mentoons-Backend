const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employees",
      index: true,
    },

    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },

    task: {
      type: String,
      required: [true, "Task is required"],
      trim: true,
    },
    notes: { type: String, trim: true, default: "" },
    tools: { type: String, trim: true, default: "" },

    complete: {
      type: String,
      enum: ["YES", "NO"],
      required: [true, "Complete or incomplete is required"],
    },

    reason: {
      type: String,
      trim: true,
      default: "",
      required: [
        function () {
          return this.complete === "NO";
        },
        "Reason is required when the task is not completed",
      ],
    },

    plan: { type: String, trim: true, default: "" },

    // Set by the admin only (not by the employee)
    didAsDiscussed: {
      type: String,
      enum: ["YES", "NO"],
    },

    late: { type: Boolean, default: false },

    submittedAt: { type: Date, default: Date.now },

    signature: { type: String, default: null },
    signedBy: { type: String, default: null }, // admin's user id
    signedByName: { type: String, default: null },
    signedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

dailyReportSchema.index({ employeeId: 1, date: 1 }, { unique: true });

dailyReportSchema.virtual("isSigned").get(function () {
  return !!this.signature;
});

const DailyReport =
  mongoose.models.DailyReport ||
  mongoose.model("DailyReport", dailyReportSchema);

module.exports = DailyReport;
