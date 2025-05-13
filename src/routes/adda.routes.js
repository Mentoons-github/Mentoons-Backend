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
const {
  getAllStatus,
  getGroupedStatuses,
  setWatchedStatus,
  createStatus,
  getUserStatus,
  deleteStatus,
} = require("../controllers/adda/status");

const addaRouter = express.Router();

// addaRouter.route("/").get(fetchAllPosts).post(uploadPost);

//status
addaRouter.get("/status", verifyToken, getGroupedStatuses);
addaRouter.patch("/watchStatus/:statusId", verifyToken, setWatchedStatus);
addaRouter.post("/addStatus", verifyToken, createStatus);
addaRouter.get("/userStatus", verifyToken, getUserStatus);
addaRouter.delete("/deleteStatus/:statusId", verifyToken, deleteStatus);

//suggestions and friendRequest
addaRouter.get("/requestSuggestions", verifyToken, requestSuggestions);
addaRouter.get("/getMyFriendRequests", verifyToken, getAllFriendRequest);
addaRouter.post("/request/:receiverId", verifyToken, sendFriendRequest);
addaRouter.patch("/acceptRequest/:requestId", acceptFriendRequest);
addaRouter.patch("/rejectRequest/:requestId", rejectFriendRequest);
addaRouter.get("/getFriends", verifyToken, getAllFriends);
addaRouter.get("/getConversations", verifyToken, getUserConversations);

//notification
addaRouter.get("/userNotifications", verifyToken, getNotifications);

module.exports = addaRouter;
