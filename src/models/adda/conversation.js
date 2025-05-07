const { default: mongoose } = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [String],
    lastMessage: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
