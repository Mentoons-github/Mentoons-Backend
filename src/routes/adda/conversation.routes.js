const express = require("express");
const verifyToken = require("../../middlewares/addaMiddleware");
const {
  getUserConversations,
  getMessageInConversation,
  deleteMessageInConversation,
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
);

module.exports = conversationRouter;
