const Conversation = require("../../models/adda/conversation");
const Message = require("../../models/adda/message");

const createConversationAndMessage = async ({
  senderId,
  receiverId,
  message = "",
}) => {
  try {
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
      });

      await conversation.save();
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message,
    });

    conversation.lastMessage = message;

    await conversation.save();
    return newMessage;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating conversation and message");
  }
};

const deleteMessage = async ({ senderId, receiverId, messageId }) => {
  try {
    const isConversationExists = await Conversation.findOne({
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
