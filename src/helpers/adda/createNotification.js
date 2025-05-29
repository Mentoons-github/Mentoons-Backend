const Notification = require("../../models/adda/notification");

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
    const notification = new Notification({
      userId,
      type,
      message,
      initiatorId,
      referenceId,
      referenceModel,
    });
    await notification.save();
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
    console.log(notifications);
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
