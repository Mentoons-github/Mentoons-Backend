const asyncHandler = require("../../utils/asyncHandler");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelper");
const Status = require("../../models/adda/status");
const FriendRequest = require("../../models/adda/friendRequest");

const getGroupedStatuses = async (req, res) => {
  try {
    const currentUserId = req.user;

    const friends = await FriendRequest.find({
      $or: [
        { senderId: currentUserId, status: "accepted" },
        { receiverId: currentUserId, status: "accepted" },
      ],
    });

    const friendIds = friends.map((f) => {
      return f.senderId.toString() === currentUserId.toString()
        ? f.receiverId
        : f.senderId;
    });

    const statuses = await Status.find({
      user: { $in: friendIds },
    })
      .populate("user", "_id name picture email")
      .populate("viewers", "_id name picture email")
      .sort({ createdAt: -1 });

    const userStatusMap = new Map();

    statuses.forEach((status) => {
      const userId = status.user._id.toString();

      if (!userStatusMap.has(userId)) {
        userStatusMap.set(userId, {
          user: status.user,
          statuses: [],
          isRead: true,
          viewers: status.viewers,
        });
      }

      const isReadByCurrentUser = status.viewers.some(
        (viewer) => viewer.toString() === currentUserId.toString()
      );

      if (!isReadByCurrentUser) {
        userStatusMap.get(userId).isRead = false;
      }

      userStatusMap.get(userId).statuses.push(status);
    });

    const myStatuses = await Status.find({ user: currentUserId })
      .populate("user", "_id name picture email")
      .sort({ createdAt: -1 });

    let myStatusGroup = null;

    if (myStatuses && myStatuses.length > 0) {
      myStatusGroup = {
        user: myStatuses[0].user,
        statuses: myStatuses,
        isRead: true,
        isOwner: true,
      };
    }

    const unreadUsers = [];
    const readUsers = [];

    if (myStatusGroup) {
      unreadUsers.push(myStatusGroup);
    }

    userStatusMap.forEach((group) => {
      if (group.isRead) {
        readUsers.push(group);
      } else {
        unreadUsers.push(group);
      }
    });

    const finalResult = [...unreadUsers, ...readUsers];

    console.log("final result :", finalResult);

    return successResponse(
      res,
      200,
      "Status fetched successfully",
      finalResult
    );
  } catch (error) {
    console.error("Error fetching grouped statuses:", error);
    return errorResponse(res, 500, "Internal Server Error");
  }
};

const setWatchedStatus = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { statusId } = req.params;

  try {
    const status = await Status.findById(statusId);

    if (!status) {
      return errorResponse(res, 404, "Status not found");
    }
    if (status.user.toString() === userId.toString()) {
      return successResponse(res, 200, "User's own status - no action taken");
    }

    await Status.findByIdAndUpdate(
      statusId,
      {
        $addToSet: { viewers: userId },
      },
      { new: true }
    );

    return successResponse(res, 200, "Successfully marked status as watched");
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Error setting watched status");
  }
});

const createStatus = asyncHandler(async (req, res) => {
  console.log("reached controller");
  const userId = req.user;
  const { content, type } = req.body;

  console.log("req body :", req.body);
  console.log("content and type :", content, type);

  if (!content || !type) {
    return errorResponse(res, 400, "Content and type are required");
  }
  try {
    const newStatus = await Status.create({
      user: userId,
      content,
      type,
      viewers: [],
    });

    return successResponse(res, 201, "Status created successfully", newStatus);
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, "Error adding status");
  }
});

const getUserStatus = asyncHandler(async (req, res) => {
  const userId = req.user;

  try {
    const statuses = await Status.find({ user: userId }).populate(
      "user",
      "_id picture"
    );

    if (!statuses || statuses.length === 0) {
      return errorResponse(res, 404, "No statuses found for the user");
    }

    return successResponse(
      res,
      200,
      "User statuses fetched successfully",
      statuses
    );
  } catch (err) {
    console.error("Error fetching user statuses:", err);
    return errorResponse(res, 500, "Error fetching user statuses");
  }
});

const deleteStatus = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { statusId } = req.params;

  try {
    const deletedStatus = await Status.findOneAndDelete({
      _id: statusId,
      user: userId,
    });

    if (!deletedStatus) {
      return errorResponse(res, 404, "Status not found or not owned by user");
    }

    return successResponse(
      res,
      200,
      "Status deleted successfully",
      deletedStatus
    );
  } catch (err) {
    console.error("Error deleting status:", err);
    return errorResponse(res, 500, "Internal Server Error");
  }
});

module.exports = {
  getGroupedStatuses,
  setWatchedStatus,
  createStatus,
  getUserStatus,
  deleteStatus,
};
