const { default: mongoose } = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String, default: "" },
    messageType: { type: String, default:'text' },
  },
  {
    timestamps: true,
  }
);

const Conversations = mongoose.model("Conversation", conversationSchema);
module.exports = Conversations;
