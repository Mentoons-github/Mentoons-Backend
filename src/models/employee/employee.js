const mongoose = require("mongoose");

const profileEditRequestSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["pending", "approved", "rejected"] },
    requestedAt: { type: Date },
    approvedAt: { type: Date },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const EmployeesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  department: {
    type: String,
    required: true,
    enum: [
      "developer",
      "illustrator",
      "designer",
      "hr",
      "marketing",
      "finance",
      "psychologist",
      "freelance",
      "sales",
    ],
  },
  jobRole: {
    type: String,
    required: true,
  },
  joinDate: { type: Date, required: true, default: Date.now },
  exitDate: { type: Date, required: false },
  salary: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  inviteStatus: {
    type: String,
    enum: ["pending", "accepted"],
    default: "pending",
  },
  passwordSetupKey: {
    type: String,
    required: false,
  },
  passwordSetupExpires: {
    type: Date,
    required: false,
  },
  profileEditRequest: { type: profileEditRequestSchema, default: null },
  employmentType: {
    type: String,
    required: true,
    enum: ["full-time", "part-time", "intern", "contract", "freelance"],
    default: "full-time",
  },
});

const Employee = mongoose.model("Employees", EmployeesSchema);

module.exports = Employee;
