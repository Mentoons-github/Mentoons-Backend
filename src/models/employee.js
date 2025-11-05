const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  houseName: {
    type: String,
    required: false,
    trim: true,
  },
  street: {
    type: String,
    required: false,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: false,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    default: "India",
    trim: true,
  },
});

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: [
      "psychologist",
      "marketing",
      "developer",
      "illustrator",
      "animator",
      "video editor",
    ],
  },
  department: {
    type: String,
    required: false,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  place: {
    type: addressSchema,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
