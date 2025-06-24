const express = require("express");
const verifyToken = require("../../middlewares/addaMiddleware");
const {
  getUserConversations,
  getMessageInConversation,
  deleteMessageInConversation,
  getConversationId,
} = require("../../controllers/adda/conversation");

const conversationRouter = express.Router();

conversationRouter
  .route("/")
  .get(verifyToken, getUserConversations)
  .post(verifyToken, deleteMessageInConversation);
conversationRouter.get(
  "/:conversationId",
  verifyToken,
  getMessageInConversation
)
.get("/conversationId/:friendId",verifyToken,getConversationId)

module.exports = conversationRouter;
