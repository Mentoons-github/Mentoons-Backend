const Notification = require("../../models/adda/notification");
const { errorResponse, successResponse } = require("../../utils/responseHelper");

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

module.exports = {
  markAllNotificationsRead,
};
