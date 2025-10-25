const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: true,
    },
    date: { type: Date, required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "onLeave", "halfDay"],
      default: "present",
    },
    workHours: { type: Number, default: 0 },
    lateBy: { type: Number, default: 0 },
    earlyLeave: { type: Number, default: 0 },
    notes: { type: String },
    remote: { type: Boolean, default: false },
    overtimeHours: { type: Number, default: 0 },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
