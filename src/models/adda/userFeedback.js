const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  showToUser: {
    type: Boolean,
    default: false,
  },
});

const UserFeedBack = mongoose.model("UserFeedback", feedbackSchema);

module.exports = UserFeedBack;
