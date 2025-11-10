const Notification = require("../../models/adda/notification");
const User = require("../../models/user");
const { getIO } = require("../../socket/socket");

const createNotification = async (
  userId,
  type,
  message,
  initiatorId,
  referenceId,
  referenceModel
) => {
  try {
    let notification = await Notification.findOne({
      userId,
      type,
      referenceId,
      referenceModel,
    });

    if (notification) {
      notification.createdAt = new Date();
      notification.message = message;
      await notification.save();
    } else {
      notification = new Notification({
        userId,
        type,
        message,
        initiatorId,
        referenceId,
        referenceModel,
      });
      await notification.save();
    }

    const receiver = await User.findById(userId);

    if (receiver?.socketIds?.length) {
      const io = getIO();
      receiver.socketIds.forEach((socketId) => {
        io.to(socketId).emit("receive_notification", notification);
      });
    }

    return notification;
  } catch (err) {
    throw new Error("Failed to create notification.");
  }
};

const fetchNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({
      userId: userId,
    }).populate("initiatorId", "name picture _id");
    return notifications;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch notifications");
  }
};

const deleteNotificationHelper = async (initiatorId, userId, type) => {

  try {
    const deleteResult = await Notification.deleteMany({
      userId,
      initiatorId,
      type,
    });
    return true;
  } catch (err) {
    console.error("❌ [deleteNotificationHelper] Error while deleting notifications:", err);
    throw new Error("Failed to delete notifications");
  }
};

module.exports = {
  createNotification,
  fetchNotifications,
  deleteNotificationHelper,
};
