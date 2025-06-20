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
    console.log(referenceId);

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

      console.log("Existing notification updated with new timestamp.");
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
      console.log("New notification created.");
    }

    const receiver = await User.findById(userId);
    if (receiver && receiver.socketIds.length > 0) {
      const io = getIO();
      receiver.socketIds.forEach((socketId) => {
        io.to(socketId).emit("receive_notification", notification);
      });
    } else {
      console.log("User is offline, notification saved to DB.");
    }

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
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

const deleteNotificationHelper = async (userId, initiatorId, type) => {
  try {
    await Notification.deleteMany({
      userId,
      initiatorId,
      type,
    });

    return true;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch notifications");
  }
};
module.exports = {
  createNotification,
  fetchNotifications,
  deleteNotificationHelper,
};
