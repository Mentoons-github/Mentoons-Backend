const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    profilePicture: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    options: [
      {
        text: { type: String, required: true },
        votes: { type: Number, default: 0 },
        voters: [{ type: String }],
      },
    ],
    createdBy: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    category: { type: String },
    isAnonymous: { type: Boolean, default: false },
    allowMultipleVotes: { type: Boolean, default: false },
    viewResults: {
      type: String,
      enum: ["immediately", "afterEnd"],
      default: "immediately",
    },
  },
  { timestamps: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    details: {
      subTitle: { type: String, required: true },
      description: { type: String, required: true },
    },
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    polls: [pollSchema],
    message: [messagesSchema],
    profileImage: { type: String, required: true },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
