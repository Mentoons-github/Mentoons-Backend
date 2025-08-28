const mongoose = require("mongoose");

const EmployeesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Employee = mongoose.model("Employees", EmployeesSchema);

module.exports = Employee;
