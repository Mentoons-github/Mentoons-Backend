const Notification = require("../../models/adda/notification");

const createNotification = async (userId, type, message, initiatorId) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      initiatorId,
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
module.exports = { createNotification, fetchNotifications };
