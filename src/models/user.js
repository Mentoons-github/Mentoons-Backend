const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "SUPER-ADMIN", "USER"],
    required: true,
    default: "USER",
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
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
      default: function() {
        return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      },
    },
  },
  activeSession: {
    type: Date,
    required: true,
    default: Date,
  },
  userActivityPerDay: {
    type: Number,
    default: 0,
  },
  assignedCalls: {
    type: Array,
    default: [],
    ref: 'RequestCall'
  }

});

const User = mongoose.model("User", UserSchema);

module.exports = User;
