const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employees",
    required: true,
  },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  totalDays: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  halfDays: { type: Number, default: 0 },
  leaveDays: { type: Number, default: 0 },
  totalHoursWorked: { type: Number, default: 0 },
  salaryAmount: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now },
});

salarySchema.index(
  { employeeId: 1, periodStart: 1, periodEnd: 1 },
  { unique: true }
);

const Salary = mongoose.model("Salary", salarySchema);

module.exports = Salary;
