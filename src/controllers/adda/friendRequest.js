const User = require("../../models/user");
const FriendRequest = require("../../models/adda/friendRequest");
const asyncHandler = require("../../utils/asyncHandler");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");
const {
  createNotification,
  fetchNotifications,
} = require("../../helpers/adda/createNotification");

const Notification = require("../../models/adda/notification");
const mongoose = require("mongoose");

const feed = require("../../models/feed");


const getAllFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.user;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  try {
    const [
      pendingReceived,
      pendingRequest,
      acceptedRequest,
      rejectedRequest,
      totalAcceptedCount,
    ] = await Promise.all([
      FriendRequest.find({ receiverId: userId, status: "pending" })
        .populate("senderId", "_id name picture")
        .populate("receiverId", "_id name picture"),

      FriendRequest.find({ senderId: userId, status: "pending" })
        .populate("senderId", "_id name picture")
        .populate("receiverId", "_id name picture"),

      FriendRequest.find({
        $or: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "_id name picture")
        .populate("receiverId", "_id name picture"),

      FriendRequest.find({
        $or: [
          { senderId: userId, status: "rejected" },
          { receiverId: userId, status: "rejected" },
        ],
      })
        .populate("senderId", "_id name picture")
        .populate("receiverId", "_id name picture"),

      FriendRequest.countDocuments({
        $or: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      }),
    ]);

    successResponse(res, 200, "Requests fetch successful", {
      pendingReceived,
      pendingRequest,
      acceptedRequest,
      rejectedRequest,
      totalAcceptedCount,
      currentPage: page,
      totalPages: Math.ceil(totalAcceptedCount / limit),
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to get the requests");
  }
});

const sendFriendRequest = asyncHandler(async (req, res) => {
  const senderId = req.user;
  const { receiverId } = req.params;

  console.log(senderId, receiverId);

  const sender = await User.findById(senderId.toString());
  if (sender.followers.includes(receiverId)) {
    return errorResponse(res, 400, "User is already your friend");
  }
  try {
    const exist = await FriendRequest.findOne({
      senderId,
      receiverId,
    }).populate("receiverId");
    if (exist) return errorResponse(res, 400, "Request already exists");

    await FriendRequest.create({
      senderId,
      receiverId,
      status: "pending",
    });

    const user = await User.findById({ _id: receiverId });

    const receiverName = user.name;
    const notificationMessage = `You have received a friend request from ${receiverName}.`;

    const noti = await createNotification(
      receiverId,
      "friend_request",
      notificationMessage,
      senderId
    );

    console.log("notification :", noti);

    successResponse(res, 200, "Friend request send successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Error making request");
  }
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  console.log(requestId);
  try {
    const request = await FriendRequest.findById(requestId).populate(
      "receiverId senderId"
    );
    console.log(request);
    if (!request) return errorResponse(res, 404, "No request found");
    request.status = "accepted";

    await request.save();

    const receiver = request.receiverId;
    const sender = request.senderId;

    await feed.findOneAndUpdate(
      { user: sender._id },
      {
        $addToSet: { followingUsers: receiver._id },
      },
      { upsert: true }
    );

    await feed.findOneAndUpdate(
      { user: receiver._id },
      {
        $addToSet: { followingUsers: sender._id },
      },
      { upsert: true }
    );

    if (!receiver.followers.includes(sender._id)) {
      receiver.followers.push(sender._id);
    }
    if (!sender.followers.includes(receiver._id)) {
      sender.followers.push(receiver._id);
    }

    const request1 = await receiver.save();
    const request2 = await sender.save();

    console.log("saved==================>", request1, request2);

    const receiverName = request.receiverId.name;
    const notificationMessage = `Your friend request to ${receiverName} has been accepted.`;

    const noti = await createNotification(
      request.receiverId._id,
      "friend_request_accepted",
      notificationMessage,
      request.senderId
    );

    console.log(noti);

    console.log("notification created");
    return successResponse(res, 200, "Friend request accepted successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Failed to accept friendRequest");
  }
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findById({ _id: requestId }).populate(
      "receiverId"
    );
    if (!request) return errorResponse(res, 404, "No request found");
    request.status = "rejected";
    await request.save();

    const receiverName = request.receiverId.name;
    const notificationMessage = `Your friend request to ${receiverName} has been rejected.`;

    await createNotification(
      request.receiverId._id,
      "friend_request_rejected",
      notificationMessage,
      request.senderId
    );

    return successResponse(res, 200, "Friend request accepted successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Failed to accept friendRequest");
  }
});

const getAllFriends = asyncHandler(async (req, res) => {
  try {
    const userId = req.user;
    const friends = await FriendRequest.find({
      $or: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    })
      .populate("senderId", "_id name picture")
      .populate("receiverId", "_id name picture");

    const friendList = friends.map((friend) => {
      return friend.senderId.toString() === userId
        ? { ...friend.receiverId.toObject(), _id: friend.receiverId._id }
        : { ...friend.senderId.toObject(), _id: friend.senderId._id };
    });

    if (friendList.length === 0) {
      return successResponse(res, 200, "No friends found", []);
    }

    return successResponse(
      res,
      200,
      "Friends fetched successfully",
      friendList
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Failed to fetch friends");
  }
});

const requestSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  console.log("suggstions fetching");
  try {
    const allRequests = await FriendRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    console.log("all requests : ", allRequests);
    const excludeId = new Set();
    allRequests.forEach((req) => {
      excludeId.add(req.senderId.toString());
      excludeId.add(req.receiverId.toString());
    });

    excludeId.add(userId);

    const suggestions = await User.find({
      _id: { $nin: Array.from(excludeId) },
    })
      .select("_id name picture")
      .skip(skip)
      .limit(limit);

    console.log("final sugestions :", suggestions);

    const totalRequests = await FriendRequest.countDocuments({
      _id: { $nin: Array.from(excludeId) },
    });

    const hasMore = skip + suggestions.length < totalRequests;

    console.log("has more :", hasMore);

    return successResponse(res, 200, "suggestions fetched successfully", {
      suggestions,
      hasMore,
    });
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Failed to fetch Suggestions");
  }
});

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user;

  try {
    const userNotifications = await fetchNotifications(userId);

    console.log(userNotifications);
    return successResponse(
      res,
      200,
      "Notifications fetched successfully",
      userNotifications
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Failed to fetch notifications");
  }
});
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user;
  const notificationId = req.params.notificationId;
  console.log("Notification ID:", notificationId);
  console.log("User ID:", userId);

  try {
    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(notificationId);
    } catch (err) {
      console.log("Invalid ObjectId format:", err);
      return errorResponse(res, 400, "Invalid notification ID format");
    }

    // Use deleteOne directly with the ObjectId
    const result = await Notification.deleteOne({ _id: objectId });

    console.log("Delete result:", result);

    if (result.deletedCount === 0) {
      return errorResponse(res, 404, "Notification not found");
    }

    return successResponse(res, 200, "Notification deleted successfully");
  } catch (err) {
    console.log("Error deleting notification:", err);
    return errorResponse(res, 500, "Failed to delete notification");
  }
});

const markReadNotification = asyncHandler(async (req, res) => {
  const userId = req.user;
  const notificationId = req.params.notificationId;
  console.log("Mark Read - Notification ID:", notificationId);
  console.log("Mark Read - User ID:", userId);

  try {
    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(notificationId);
    } catch (err) {
      console.log("Invalid ObjectId format:", err);
      return errorResponse(res, 400, "Invalid notification ID format");
    }

    // Use updateOne directly with the ObjectId
    const result = await Notification.updateOne(
      { _id: objectId },
      { $set: { isRead: true } }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      return errorResponse(res, 404, "Notification not found");
    }

    return successResponse(res, 200, "Notification marked as read");
  } catch (error) {
    console.log("Error marking notification as read:", error);
    return errorResponse(res, 500, "Failed to mark notification as read");

const unfriend = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user;
  const { friendId } = req.params;

  try {
    const checkFriendRequest = await FriendRequest.findOne({
      $or: [
        {
          senderId: userId,
          receiverId: friendId,
          status: { $in: ["accepted", "one_way"] },
        },
        {
          senderId: friendId,
          receiverId: userId,
          status: { $in: ["accepted", "one_way"] },
        },
      ],
    });

    if (!checkFriendRequest) {
      return errorResponse(res, 404, "No friend request found");
    }

    if (checkFriendRequest.status === "one_way") {
      await FriendRequest.deleteOne({ _id: checkFriendRequest._id });
    } else {
      const isUserSender =
        checkFriendRequest.senderId.toString() === userId.toString();

      await FriendRequest.findByIdAndUpdate(checkFriendRequest._id, {
        status: "one_way",
        senderId: isUserSender ? friendId : userId,
        receiverId: isUserSender ? userId : friendId,
      });
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { followers: friendId },
      }),
      feed.findByIdAndUpdate(userId, {
        $pull: { followingUsers: friendId },
      }),
    ]);

    return successResponse(res, 200, "Unfriend/Unfollow successful");
  } catch (err) {
    console.log("Error found:", err);
    return errorResponse(res, 500, "Internal server error");
  }
});

module.exports = {
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

};
