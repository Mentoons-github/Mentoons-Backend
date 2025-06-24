const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    fileType: { type: String, enum: ["text", "image", "audio", "file", "video"], default: "text" },
    isRead: {
      type: Boolean,
      required: false,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default:false
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
