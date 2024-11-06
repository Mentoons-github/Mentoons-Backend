const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "super-admin", "user"],
    required: true,
    default: "user",
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  picture: {
    type: String,
  },
  subscription: {
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
    validUntil: {
      type: Date,
      required: true,
      default: null,
    },
  },
  activeSession: {
    type: Date,
    required: true,
    default: new Date.now(),
  },
  userActivityPerDay: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
