// const { fetchAllPosts, uploadPost } = require("../controllers/adda");
const {
  getAllFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  requestSuggestions,
  getAllFriends,
  getNotifications,
} = require("../controllers/adda/friendRequest");

const { getUserConversations } = require("../controllers/adda/conversation");

const express = require("express");
const verifyToken = require("../middlewares/addaMiddleware");

const addaRouter = express.Router();

// addaRouter.route("/").get(fetchAllPosts).post(uploadPost);
addaRouter.get("/requestSuggestions", verifyToken, requestSuggestions);
addaRouter.get("/getMyFriendRequests", verifyToken, getAllFriendRequest);
addaRouter.post("/request/:receiverId", verifyToken, sendFriendRequest);
addaRouter.patch("/acceptRequest/:requestId", acceptFriendRequest);
addaRouter.patch("/rejectRequest/:requestId", rejectFriendRequest);
addaRouter.get("/getFriends", verifyToken, getAllFriends);
addaRouter.get("/getConversations", verifyToken, getUserConversations);
addaRouter.get("/userNotifications", verifyToken, getNotifications);

module.exports = addaRouter;
