const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    state: { type: string, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    psychologistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "completed", "cancelled", "pending", "aborted"],
      default: "booked",
    },
    completedAt: { type: Date, default: null, expires: 86400 },
    description: { type: String },
  },
  { timestamps: true }
);

const SessionModel = mongoose.model("SessionCalls", sessionSchema);
module.exports = SessionModel;
