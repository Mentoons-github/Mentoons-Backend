const { fetchAllPosts, uploadPost } = require("../controllers/adda");
const {
  getAllFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getAllFriends,
} = require("../controllers/adda/friendRequest");

const { getUserConversations } = require("../controllers/adda/conversation");

const express = require("express");

const addaRouter = express.Router();

addaRouter.route("/").get(fetchAllPosts).post(uploadPost);
addaRouter.get("/getMyFriendRequests", getAllFriendRequest);
addaRouter.post("/request/:receiverId", sendFriendRequest);
addaRouter.patch("/request/:requestId/accept", acceptFriendRequest);
addaRouter.patch("/request/:requestId/reject", rejectFriendRequest);
addaRouter.get("/getFriends", getAllFriends);
addaRouter.get("/getConversations", getUserConversations);

module.exports = addaRouter;
