const Notification = require("../../models/adda/notification");

const createNotification = async (userId, type, message) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    throw new Error("Failed to create notification.");
  }
};

module.exports = { createNotification };
