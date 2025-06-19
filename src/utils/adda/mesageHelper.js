const Conversations = require("../../models/adda/conversation");
const FriendRequest = require("../../models/adda/friendRequest");
const Message = require("../../models/adda/message");

const createConversationAndMessage = async ({ senderId, receiverId }) => {
  try {
    const checkFriendRequest = await FriendRequest.findOne({
      $or: [
        { senderId, receiverId, status: "accepted" },
        { senderId: receiverId, receiverId: senderId, status: "accepted" },
      ],
    });

    if (!checkFriendRequest) {
      throw new Error("Friend request not found or not accepted");
    }

    let conversation = await Conversations.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = new Conversations({
        members: [senderId, receiverId],
      });

      await conversation.save();
    }

    return conversation;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating conversation and message");
  }
};

const deleteMessage = async ({ senderId, receiverId, messageId }) => {
  try {
    const isConversationExists = await Conversations.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!isConversationExists) {
      throw new Error("No conversation found");
    }

    const isMessageExists = await Message.findOne({ _id: messageId });

    if (!isMessageExists) {
      throw new Error("Message not found");
    }

    if (isMessageExists.senderId !== senderId) {
      throw new Error("You can only delete your own messages");
    }

    await isMessageExists.deleteOne();

    const lastMessage = await Message.findOne({
      conversationId: isConversationExists._id,
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (lastMessage) {
      isConversationExists.lastMessage = lastMessage;
    } else {
      isConversationExists.lastMessage = "";
    }

    await isConversationExists.save();

    return "Message deleted successfully";
  } catch (err) {
    throw new Error("Error deleting message");
  }
};

module.exports = { createConversationAndMessage, deleteMessage };
