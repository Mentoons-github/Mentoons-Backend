const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String },
  uploadedAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "earned", "unpaid", "maternity", "other"],
      required: true,
    },
    reason: { type: String, required: true, trim: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: [attachmentSchema],
    notes: { type: String },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ employeeId: 1, fromDate: 1, toDate: 1 });

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

module.exports = LeaveRequest;
