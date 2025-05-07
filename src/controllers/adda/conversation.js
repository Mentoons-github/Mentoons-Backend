const Conversation = require("../../models/adda/conversation");
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
  const message = req.body.message;
  try {
    const newConversationAndMessage = await createConversationAndMessage({
      senderId,
      receiverId,
      message,
    });

    return successResponse(
      res,
      200,
      "Conversation and message added successfully",
      newConversationAndMessage
    );
  } catch (err) {
    console.log("message creation error :", err);
    return errorResponse(res, 500, "Error creating conversation and message");
  }
});

const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  try {
    const userConversations = await Conversations.find({
      members: { $in: [userId] },
    });

    return successResponse(
      res,
      200,
      `${
        userConversations.length === 0
          ? "No conversations found"
          : "Conversations fetched successfully"
      }`,
      userConversations
    );
  } catch (err) {
    return errorResponse(res, 500, "Failed Get conversations");
  }
});

const getMessageInConversation = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;
  const before = req.query.before;
  const limit = 50;

  try {
    let messagesQuery = Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit);

    if (before) {
      messagesQuery = messagesQuery.where("createdAt").lt(new Date(before));
    }

    const allMessages = await messagesQuery;

    const sortedMessages = allMessages.sort(
      (a, b) => a.createdAt - b.createdAt
    );

    return successResponse(
      res,
      200,
      "Messages fetched successfully",
      sortedMessages
    );
  } catch (err) {
    console.log("Error fetching messages:", err);
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
