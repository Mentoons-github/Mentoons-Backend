const Conversations = require("../../models/adda/conversation");
const Message = require("../../models/adda/message");
const {
  createConversationAndMessage,
  deleteMessage,
} = require("../../utils/adda/mesageHelper");
const asyncHandler = require("../../utils/asyncHandler");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const newConversationAndMessage = asyncHandler(async (req, res) => {
  const senderId = req.userId;
  const receiverId = req.body.receiverId;

  try {
    const newConversation = await createConversationAndMessage({
      senderId,
      receiverId,
    });

    return successResponse(
      res,
      200,
      "Conversation and message added successfully",
      newConversation
    );
  } catch (err) {
    console.log("message creation error :", err);
    return errorResponse(res, 500, "Error creating conversation and message");
  }
});

const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user;
  console.log(userId)

  try {
    const userConversations = await Conversations.find({
      members:userId 
    }).populate("members", "name picture email bio socketIds");

    const formattedConversations = userConversations.map((convo) => {
      const friend = convo.members.find(
        (member) => member._id.toString() !== userId.toString()
      );

      return {
        conversation_id: convo._id,
        friend: {
          _id: friend._id,
          name: friend.name,
          picture: friend.picture,
          email: friend.email,
          bio: friend.bio,
          isOnline: friend.socketIds && friend.socketIds.length > 0,
        },
        lastMessage: convo.lastMessage || null,
        updatedAt: convo.updatedAt,
        createdAt: convo.createdAt,
      };
    });

    return successResponse(
      res,
      200,
      formattedConversations.length === 0
        ? "No conversations found"
        : "Conversations fetched successfully",
      formattedConversations
    );
  } catch (err) {
    console.error("Failed to get conversations:", err);
    return errorResponse(res, 500, "Failed to get conversations");
  }
});

const getMessageInConversation = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  const before = req.query.before;
  const limit = 50;

  try {
    let query = { conversationId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return successResponse(res, 200, "Messages fetched successfully", messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return errorResponse(res, 500, "Failed to get messages");
  }
});

const deleteMessageInConversation = asyncHandler(async (req, res) => {
  const senderId = req.body.userId;
  const receiverId = req.params.receiverId;
  const messageId = req.body.messageId;

  try {
    const messageDeletion = await deleteMessage({
      messageId,
      receiverId,
      senderId,
    });

    return successResponse(res, 200, messageDeletion);
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Message deletion failed");
  }
});

module.exports = {
  newConversationAndMessage,
  getUserConversations,
  getMessageInConversation,
  deleteMessageInConversation,
};
