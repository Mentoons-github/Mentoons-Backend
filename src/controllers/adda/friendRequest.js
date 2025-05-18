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

  // Check if already mutual (i.e., receiver is following sender and vice versa)
  if (
    sender.following.includes(receiverId) &&
    sender.followers.includes(receiverId)
  ) {
    return errorResponse(res, 400, "User is already your friend");
  }

  try {
    const exist = await FriendRequest.findOne({
      senderId,
      receiverId,
      status: "pending",
    }).populate("receiverId");

    if (exist) return errorResponse(res, 400, "Request already exists");

    // Clean up old requests
    await FriendRequest.deleteMany({
      senderId,
      receiverId,
      status: { $in: ["cancelled", "rejected", "one_way"] },
    });

    // Create new friend request
    await FriendRequest.create({
      senderId,
      receiverId,
      status: "pending",
    });

    // ⬇️ Add follow relationship (one-way: sender follows receiver)
    await User.findByIdAndUpdate(senderId, {
      $addToSet: { following: receiverId },
    });

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { followers: senderId },
    });

    // Notification logic
    const senderName = sender.name;
    const notificationMessage = `You have received a friend request from ${senderName}.`;

    const noti = await createNotification(
      receiverId,
      "friend_request",
      notificationMessage,
      senderId
    );

    console.log("notification :", noti);

    successResponse(res, 200, "Friend request sent successfully");
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
    console.log("requstId got :", request);
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
  const searchTerm = req.query.search || "";

  console.log(searchTerm);

  try {
    const activeRequests = await FriendRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: { $in: ["pending", "accepted"] },
    });

    console.log("Active friend requests: ", activeRequests);

    const excludeId = new Set();
    activeRequests.forEach((request) => {
      excludeId.add(request.senderId.toString());
      excludeId.add(request.receiverId.toString());
    });

    excludeId.add(userId.toString());

    const query = {
      _id: { $nin: Array.from(excludeId) },
    };

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const suggestions = await User.find(query)
      .select("_id name picture")
      .skip(skip)
      .limit(limit);

    const totalSuggestions = await User.countDocuments(query);

    const hasMore = skip + suggestions.length < totalSuggestions;

    console.log("Final suggestions: ", suggestions);
    console.log("Has more: ", hasMore);

    return successResponse(res, 200, "Suggestions fetched successfully", {
      suggestions,
      hasMore,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Failed to fetch suggestions");
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
  }
});

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

const checkFriendStatus = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { friendId } = req.params;

  try {
    const sentRequest = await FriendRequest.findOne({
      senderId: userId,
      receiverId: friendId,
    });

    const receivedRequest = await FriendRequest.findOne({
      senderId: friendId,
      receiverId: userId,
    });

    if (!sentRequest && !receivedRequest) {
      return successResponse(res, 200, "No friend relationship found", {
        status: "none",
        isRequester: false,
      });
    }

    if (sentRequest) {
      return successResponse(res, 200, "Friend request status found", {
        status: sentRequest.status,
        isRequester: true,
        requestId: sentRequest._id,
      });
    }

    if (receivedRequest) {
      return successResponse(res, 200, "Friend request status found", {
        status: receivedRequest.status,
        isRequester: false,
        requestId: receivedRequest._id,
      });
    }
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Internal server error");
  }
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { friendId } = req.params;

  try {
    const updatedRequest = await FriendRequest.findOneAndUpdate(
      {
        senderId: userId,
        receiverId: friendId,
        status: "pending",
      },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!updatedRequest) {
      return errorResponse(res, 404, "No pending request to cancel");
    }

    return successResponse(res, 200, "Friend request cancelled");
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Internal server error");
  }
});

const getFollowBackUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const followers = await FriendRequest.find({
      receiverId: userId,
      status: "accepted",
    }).select("senderId");

    const followerIds = followers.map((req) => req.senderId.toString());

    if (followerIds.length === 0) {
      return res.status(200).json([]);
    }

    const followingBack = await FriendRequest.find({
      senderId: userId,
      receiverId: { $in: followerIds },
      status: "accepted",
    }).select("receiverId");

    const alreadyFollowingIds = new Set(
      followingBack.map((req) => req.receiverId.toString())
    );

    const rejectedRequests = await FriendRequest.find({
      senderId: userId,
      receiverId: { $in: followerIds },
      status: "rejected",
    }).select("receiverId");

    const rejectedIds = new Set(
      rejectedRequests.map((req) => req.receiverId.toString())
    );

    const followBackUserIds = followerIds.filter(
      (id) => !alreadyFollowingIds.has(id) && !rejectedIds.has(id)
    );

    const followBackUsers = await User.find(
      { _id: { $in: followBackUserIds } },
      { name: 1, picture: 1 }
    );

    successResponse(
      res,
      200,
      "Users available to follow back fetched successfully",
      followBackUsers
    );
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
});

const declineFollowBack = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.body;

  try {
    const incomingRequest = await FriendRequest.findOne({
      senderId: targetUserId,
      receiverId: userId,
      status: { $in: ["pending", "accepted"] },
    });

    if (!incomingRequest) {
      return errorResponse(res, 404, "No follow request to decline.");
    }

    let request = await FriendRequest.findOne({
      senderId: userId,
      receiverId: targetUserId,
    });

    if (request) {
      if (request.status === "rejected") {
        return successResponse(res, 200, "Already declined.");
      }
      request.status = "rejected";
      await request.save();
    } else {
      request = new FriendRequest({
        senderId: userId,
        receiverId: targetUserId,
        status: "rejected",
      });
      await request.save();
    }

    successResponse(res, 200, "Follow back declined successfully.");
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
});

const followBackUser = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;

  try {
    const existing = await FriendRequest.findOne({
      senderId,
      receiverId,
    });

    if (existing && existing.status === "accepted") {
      return errorResponse(res, 400, "Already following this user");
    }

    if (existing && existing.status === "pending") {
      return errorResponse(res, 400, "Request already sent");
    }

    await FriendRequest.create({
      senderId,
      receiverId,
      status: "pending",
    });

    const sender = await User.findById(senderId);
    await createNotification(
      receiverId,
      "follow_back",
      `${sender.name} has followed you back.`,
      senderId
    );

    return successResponse(res, 200, "Follow back request sent");
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Failed to send follow back request");
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
  checkFriendStatus,
  cancelFriendRequest,
  getFollowBackUsers,
  declineFollowBack,
  followBackUser,
  unfriend,
};
