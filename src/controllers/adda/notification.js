const Notification = require("../../models/adda/notification");
const asyncHandler = require("../../utils/asyncHandler");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const markAllNotificationsRead = async (req, res) => {
  const userId = req.user;

  console.log(userId);

  try {
    const notifications = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    console.log("notifications :", notifications);

    return successResponse(res, 200, "All notifications marked as read");
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user._id;
    console.log("getting notifications");

    const notifications = await Notification.find({ userId: adminId }).sort({
      createdAt: -1,
    });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        message: "No notifications found",
      });
    }

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  if (!notificationId) {
    return res.status(400).json({ message: "Notification ID is required" });
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    userId: userId,
  });

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  if (notification.isRead) {
    return res
      .status(200)
      .json({ message: "Notification already marked as read" });
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ message: "Notification marked as read successfully" });
});

module.exports = {
  markAllNotificationsRead,
  getAdminNotifications,
  markNotificationRead,
};
