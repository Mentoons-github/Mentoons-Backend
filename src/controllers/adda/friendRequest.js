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
  deleteNotificationHelper,
} = require("../../helpers/adda/createNotification");

const Notification = require("../../models/adda/notification");
const mongoose = require("mongoose");

const feed = require("../../models/feed");
const {
  checkFriendRequestAccess,
  incrementFreeSubscriptionCounts,
  decrementFreeSubscriptionCounts,
} = require("../../helpers/adda/subscription");

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

  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!receiver) {
    return errorResponse(res, 404, "Receiver user not found");
  }

  const accessCheck = checkFriendRequestAccess(sender);
  if (!accessCheck.allowed) {
    return errorResponse(res, 403, {
      upgradeRequired: accessCheck.upgradeRequired,
      upgradeTo: accessCheck.upgradeTo,
      planType: accessCheck.planType,
      modalType: accessCheck.modalType,
      message: accessCheck.message,
    });
  }

  const isAlreadyFriend =
    sender.following.includes(receiverId) &&
    sender.followers.includes(receiverId);

  if (isAlreadyFriend) {
    return errorResponse(res, 400, "User is already your friend");
  }

  const existingRequest = await FriendRequest.findOne({
    senderId,
    receiverId,
    status: "pending",
  });

  if (existingRequest) {
    return errorResponse(res, 400, "Friend request already sent");
  }

  await FriendRequest.deleteMany({
    senderId,
    receiverId,
    status: { $in: ["cancelled", "rejected", "one_way"] },
  });

  const request = await FriendRequest.create({
    senderId,
    receiverId,
    status: "pending",
  });

  await createNotification(
    receiverId,
    "friend_request",
    `You have received a friend request from ${sender.name}.`,
    senderId,
    request._id,
    "FriendRequest",
  );

  return successResponse(res, 200, "Friend request sent successfully");
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findById(requestId).populate(
      "receiverId senderId",
    );

    if (!request) {
      return errorResponse(res, 404, "No request found");
    }

    if (request.status === "accepted") {
      return successResponse(res, 200, "Friend request already accepted");
    }

    const receiver = request.receiverId;
    const sender = request.senderId;

    await incrementFreeSubscriptionCounts(sender._id, "following");
    await incrementFreeSubscriptionCounts(receiver._id, "follower");

    const accessCheck = checkFriendRequestAccess(receiver);
    if (!accessCheck.allowed) {
      return errorResponse(res, 403, accessCheck.message, {
        upgradeRequired: accessCheck.upgradeRequired,
        upgradeTo: accessCheck.upgradeTo,
        planType: accessCheck.planType,
        modalType: accessCheck.modalType,
        message: accessCheck.message,
      });
    }

    request.status = "accepted";
    await request.save();

    if (!sender.following.includes(receiver._id)) {
      sender.following.push(receiver._id);
    }

    if (!receiver.followers.includes(sender._id)) {
      receiver.followers.push(sender._id);
    }

    await sender.save();
    await receiver.save();

    await feed.findOneAndUpdate(
      { user: sender._id },
      { $addToSet: { followingUsers: receiver._id } },
      { upsert: true },
    );

    await deleteNotificationHelper(sender._id, receiver._id, "friend_request");

    await createNotification(
      sender._id,
      "friend_request_accepted",
      `${receiver.name} accepted your friend request.`,
      receiver._id,
      request._id,
      "FriendRequest",
    );

    console.log(receiver, "receiver");
    console.log(sender, "sender");

    return successResponse(res, 200, "Friend request accepted successfully");
  } catch (err) {
    return errorResponse(res, 500, "Failed to accept friend request");
  }
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findById({ _id: requestId }).populate(
      "receiverId",
    );
    if (!request) return errorResponse(res, 404, "No request found");

    request.status = "rejected";
    await request.save();

    const receiverName = request.receiverId?.name || "Unknown";
    const notificationMessage = `Your friend request to ${receiverName} has been rejected.`;

    await deleteNotificationHelper(
      request.senderId._id,
      request.receiverId._id,
      "friend_request",
    );

    await createNotification(
      request.senderId._id,
      "friend_request_rejected",
      notificationMessage,
      request.receiverId._id,
      request._id,
      "FriendRequest",
    );

    return successResponse(res, 200, "Friend request rejected successfully");
  } catch (err) {
    return errorResponse(res, 500, "Failed to reject friend request");
  }
});

const getAllFriends = asyncHandler(async (req, res) => {
  try {
    const userId = req.user;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      console.log("Invalid page number:", page);
      return errorResponse(res, 400, "Invalid page number");
    }
    if (isNaN(limitNum) || limitNum < 1) {
      console.log("Invalid limit value:", limit);
      return errorResponse(res, 400, "Invalid limit value");
    }

    const user = await User.findOne({
      _id: userId,
      role: { $nin: ["EMPLOYEE", "ADMIN"] },
    }).select("followers following");

    if (!user) {
      console.log("User not found:", userId);
      return errorResponse(res, 404, "User not found");
    }

    const followers = user.followers.map((id) => id.toString());
    const following = user.following.map((id) => id.toString());

    const mutualIds = followers.filter((id) => following.includes(id));

    if (mutualIds.length === 0) {
      return successResponse(res, 200, "No friends found", {
        friends: [],
        totalCount: 0,
        currentPage: pageNum,
        totalPages: 0,
      });
    }

    const skip = (pageNum - 1) * limitNum;
    const totalCount = mutualIds.length;
    const totalPages = Math.ceil(totalCount / limitNum);

    const friends = await User.find(
      { _id: { $in: mutualIds }, role: { $nin: ["EMPLOYEE", "ADMIN"] } },
      { name: 1, picture: 1, following: 1, followers: 1 },
    )
      .skip(skip)
      .limit(limitNum);

    return successResponse(res, 200, "Friends fetched successfully", {
      friends,
      totalCount,
      currentPage: pageNum,
      totalPages,
    });
  } catch (err) {
    console.error("Error in getAllFriends:", err);
    return errorResponse(res, 500, "Failed to fetch friends");
  }
});

const requestSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const searchTerm = req.query.search || "";

  try {
    const activeRequests = await FriendRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: { $in: ["pending", "accepted"] },
    });

    const excludeId = new Set();
    activeRequests.forEach((request) => {
      excludeId.add(request.senderId.toString());
      excludeId.add(request.receiverId.toString());
    });

    excludeId.add(userId.toString());

    const query = {
      _id: {
        $nin: Array.from(excludeId),
      },
      role: { $nin: ["EMPLOYEE", "ADMIN"] },
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

    console.log(suggestions);
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
    return successResponse(
      res,
      200,
      "Notifications fetched successfully",
      userNotifications,
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
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(notificationId);
      console.log("objectId : ", objectId);
    } catch (err) {
      console.log("Invalid ObjectId format:", err);
      return errorResponse(res, 400, "Invalid notification ID format");
    }

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

const ClearAllNotification = asyncHandler(async (req, res) => {
  const userId = req.user;
  try {
    await Notification.deleteMany({ userId });
    return successResponse(res, 200, "Notification Cleared successfully");
  } catch (err) {
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
      { $set: { isRead: true } },
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
    // find existing accepted connection
    const friendRequest = await FriendRequest.findOne({
      $or: [{ senderId: userId, receiverId: friendId, status: "accepted" }],
    });

    if (!friendRequest) {
      return errorResponse(res, 404, "No friendship found");
    }

    // delete friendship
    await FriendRequest.deleteOne({ _id: friendRequest._id });

    // remove follow data from both users + feeds
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { following: friendId },
      }),

      User.findByIdAndUpdate(friendId, {
        $pull: { followers: userId },
      }),

      feed.findByIdAndUpdate(userId, {
        $pull: { followingUsers: friendId },
      }),

      feed.findByIdAndUpdate(friendId, {
        $pull: { followingUsers: userId },
      }),
    ]);

    // subscription count update
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (user?.subscription?.plan === "free") {
      await decrementFreeSubscriptionCounts(userId, "following");
    }

    if (friend?.subscription?.plan === "free") {
      await decrementFreeSubscriptionCounts(friendId, "follower");
    }

    return successResponse(res, 200, "Unfollow successful");
  } catch (err) {
    console.error("Unfollow error:", err);
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

    console.log(sentRequest, "sentrequesttt");
    console.log(receivedRequest, "receive");

    if (!sentRequest && !receivedRequest) {
      return successResponse(res, 200, "No friend relationship found", {
        status: "none",
        isRequester: false,
      });
    }

    // successResponse(res, 200, "Friend request status found", {
    //   sender: {
    //     status: sentRequest.status,
    //     isRequester: sentRequest ? true : false,
    //     requestId: sentRequest._id,
    //   },

    //   receiver: {
    //     status: receivedRequest.status,
    //     isRequester: receivedRequest ? true : false,
    //     requestId: receivedRequest._id,
    //   },
    // });

    if (sentRequest) {
      return successResponse(res, 200, "Friend request status found", {
        status: sentRequest.status,
        isRequester: true,
        requestId: sentRequest._id,
        receiveRequestStatus: receivedRequest?.status,
        receiveRequestId: receivedRequest?._id,
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
    const user = await User.findById(userId).select("name");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    const updatedRequest = await FriendRequest.findOneAndUpdate(
      {
        senderId: userId,
        receiverId: friendId,
        status: "pending",
      },
      { $set: { status: "cancelled" } },
      { new: true },
    );
    await deleteNotificationHelper(friendId, userId, "friend_request");

    await createNotification(
      friendId,
      "friend_request_rejected",
      `${user.name} has cancelled the friend request.`,
      userId,
      updatedRequest._id.toString(),
      "FriendRequest",
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
      return successResponse(res, 200, "No followers found", []);
    }

    const existingFollowBacks = await FriendRequest.find({
      senderId: userId,
      receiverId: { $in: followerIds },
      status: { $in: ["accepted", "pending"] },
    }).select("receiverId");

    const alreadyOrPendingFollowIds = new Set(
      existingFollowBacks.map((req) => req.receiverId.toString()),
    );

    const rejectedRequests = await FriendRequest.find({
      senderId: userId,
      receiverId: { $in: followerIds },
      status: "rejected",
    }).select("receiverId");

    const rejectedIds = new Set(
      rejectedRequests.map((req) => req.receiverId.toString()),
    );

    const followBackUserIds = followerIds.filter(
      (id) => !alreadyOrPendingFollowIds.has(id) && !rejectedIds.has(id),
    );

    const followBackUsers = await User.find(
      { _id: { $in: followBackUserIds } },
      { name: 1, picture: 1 },
    );

    successResponse(
      res,
      200,
      "Users available to follow back fetched successfully",
      followBackUsers,
    );
  } catch (err) {
    console.error("Error fetching follow-back users:", err);
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

    const decliner = await User.findById(userId);

    await createNotification(
      targetUserId,
      "friend_request_rejected",
      `${decliner.name} has declined your follow request.`,
      userId,
      request._id,
      "FriendRequest",
    );

    return successResponse(res, 200, "Follow back declined successfully.");
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Internal server error");
  }
});

const followBackUser = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.params;

  console.log("Follow back initiated");
  console.log("Sender ID:", senderId);
  console.log("Receiver ID:", receiverId);

  try {
    const sender = await User.findById(senderId).select(
      "subscription subscriptionLimits followers following name",
    );

    if (!sender) {
      return errorResponse(res, 404, "User not found");
    }

    await incrementFreeSubscriptionCounts(sender._id, "following");
    await incrementFreeSubscriptionCounts(receiverId, "follower");

    const accessCheck = checkFriendRequestAccess(sender);
    if (!accessCheck.allowed) {
      return errorResponse(res, 403, accessCheck.message, {
        upgradeRequired: accessCheck.upgradeRequired,
        upgradeTo: accessCheck.upgradeTo,
        planType: accessCheck.planType,
        modalType: accessCheck.modalType,
        message: accessCheck.message,
      });
    }

    const existing = await FriendRequest.findOne({ senderId, receiverId });
    console.log("Existing FriendRequest:", existing);

    if (existing && existing.status === "accepted") {
      console.log("Already following this user");
      return errorResponse(res, 400, "Already following this user");
    }

    if (existing && existing.status === "pending") {
      console.log("Friend request already sent");
      return errorResponse(res, 400, "Request already sent");
    }

    const newRequest = await FriendRequest.create({
      senderId,
      receiverId,
      status: "accepted",
    });

    console.log("New FriendRequest created:", newRequest);

    const updatedSender = await User.findByIdAndUpdate(
      senderId,
      { $addToSet: { following: receiverId } },
      { new: true },
    );
    console.log("Updated sender (following added):", updatedSender);

    const updatedReceiver = await User.findByIdAndUpdate(
      receiverId,
      { $addToSet: { followers: senderId } },
      { new: true },
    );
    console.log("Updated receiver (followers added):", updatedReceiver);

    const updatedFeed = await feed.findOneAndUpdate(
      { user: senderId },
      { $addToSet: { followingUsers: receiverId } },
      { upsert: true, new: true },
    );
    console.log("Updated sender feed (followingUsers):", updatedFeed);

    await User.findById(senderId);

    await deleteNotificationHelper(receiverId, senderId, "friend_request");

    await createNotification(
      receiverId,
      "follow_back",
      `${sender.name} has followed you back.`,
      senderId,
      newRequest._id,
      "FriendRequest",
    );
    console.log("Follow back notification sent");

    return successResponse(res, 200, "Follow back completed successfully");
  } catch (err) {
    console.log("Error in followBackUser:", err);
    return errorResponse(res, 500, "Failed to follow back user");
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
  ClearAllNotification,
  getFollowBackUsers,
  declineFollowBack,
  followBackUser,
  unfriend,
};
