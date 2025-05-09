const FriendRequest = require("../../models/adda/friendRequest");
const asyncHandler = require("../../utils/asyncHandler");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const getAllFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.body.userId;
  

  try {
    const [pendingReceived, pendingRequest, acceptedRequest, rejectedRequest] =
      await Promise.all([
        FriendRequest.find({ receiverId: userId, status: "pending" }),
        FriendRequest.find({ senderId: userId, status: "pending" }),
        FriendRequest.find({
          $or: [
            { senderId: userId, status: "accepted" },
            { receiverId: userId, status: "accepted" },
          ],
        }).sort({ createdAt: -1 }),
        FriendRequest.find({
          $or: [
            { senderId: userId, status: "rejected" },
            { receiverId: userId, status: "rejected" },
          ],
        }),
      ]);

    successResponse(res, 200, "Requests fetch successful", {
      pendingReceived,
      pendingRequest,
      acceptedRequest,
      rejectedRequest,
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to get the requests");
  }
});

const sendFriendRequest = asyncHandler(async (req, res) => {
  const senderId = req.body.userId;
  const { receiverId } = req.query;

  try {
    const exist = await FriendRequest.findOne({ senderId, receiverId });
    if (exist) return errorResponse(res, 400, "Request already exists");

    await FriendRequest.create({
      senderId,
      receiverId,
      status: "pending",
    });

    successResponse(res, 200, "Friend request send successfully");
  } catch (err) {
    errorResponse(res, 500, "Error making request");
  }
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.query;

  try {
    const request = await FriendRequest.findById({ _id: requestId });
    if (!request) return errorResponse(res, 404, "No request found");
    request.status = "accepted";

    await request.save();
    return successResponse(res, 200, "Friend request accepted successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Failed to accept friendRequest");
  }
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.query;

  try {
    const request = await FriendRequest.findById({ _id: requestId });
    if (!request) return errorResponse(res, 404, "No request found");
    request.status = "rejected";

    await request.save();
    return successResponse(res, 200, "Friend request accepted successfully");
  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Failed to accept friendRequest");
  }
});

const getAllFriends = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const friends = await FriendRequest.find({
      $or: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    })
      .populate("senderId", "name picture")
      .populate("receiverId", "name picture");

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

module.exports = {
  getAllFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getAllFriends,
};
