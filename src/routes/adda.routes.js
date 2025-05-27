// const { fetchAllPosts, uploadPost } = require("../controllers/adda");
const {
  getAllFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  requestSuggestions,
  getAllFriends,
  getNotifications,
  deleteNotification,
  markReadNotification,
  unfriend,
  checkFriendStatus,
  cancelFriendRequest,
  getFollowBackUsers,
  declineFollowBack,
  followBackUser,
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
const { Verification } = require("@clerk/clerk-sdk-node");
const { conditionalAuth } = require("../middlewares/auth.middleware");
const {
  markAllNotificationsRead,
} = require("../controllers/adda/notification");

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
addaRouter.post("/unfriend/:friendId", verifyToken, unfriend);
addaRouter.post("/cancelRequest/:friendId", verifyToken, cancelFriendRequest);
addaRouter.get(
  "/check-friend-status/:friendId",
  verifyToken,
  checkFriendStatus
);
addaRouter.get("/getFollowBackUsers", verifyToken, getFollowBackUsers);
addaRouter.post("/declineFollowBack", verifyToken, declineFollowBack);
addaRouter.post("/follow-back/:receiverId", verifyToken, followBackUser);
addaRouter.get("/userNotifications", verifyToken, getNotifications);

//notification
addaRouter.delete(
  "/userNotifications/:notificationId",
  verifyToken,
  deleteNotification
);
addaRouter.post(
  "/userNotifications/:notificationId",
  verifyToken,
  markReadNotification
);

addaRouter.patch(
  "/markAllNotificationsRead",
  verifyToken,
  markAllNotificationsRead
);

module.exports = addaRouter;
