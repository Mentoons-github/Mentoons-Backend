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

    console.log("Pending Friend Requests Received:", pendingReceived);
    console.log("Pending Friend Requests Sent:", pendingRequest);
    console.log("Accepted Friend Requests:", acceptedRequest);
    console.log("Rejected Friend Requests:", rejectedRequest);
    console.log("Total Accepted Count:", totalAcceptedCount);

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
    const request = await FriendRequest.findById({ _id: requestId }).populate(
      "receiverId"
    );
    console.log(request);
    if (!request) return errorResponse(res, 404, "No request found");
    request.status = "accepted";
    console.log("request", request);
    await request.save();

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

module.exports = {
  getAllFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  requestSuggestions,
  getAllFriends,
  getNotifications,
};
