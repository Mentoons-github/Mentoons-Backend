const Report = require("../../models/adda/reportAndAbuse");
const Feed = require("../../models/feed");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const reportUserPost = async (req, res) => {
  const { friendId, postId, reason } = req.body;
  const userId = req.user;

  console.log("Received report request:", { userId, friendId, postId, reason });

  try {
    if (!reason || !postId || !friendId) {
      console.error("Missing required fields:", { reason, postId, friendId });
      return errorResponse(
        res,
        400,
        "Report reason, post ID, and user ID are required."
      );
    }

    if (userId === friendId) {
      console.warn("Self-report attempt detected:", { userId, friendId });
      return errorResponse(res, 400, "You cannot report yourself.");
    }

    console.log("Checking for existing report:", {
      reporter: userId,
      reportedUser: friendId,
      postId,
    });
    const alreadyReported = await Report.findOne({
      reporter: userId,
      reportedUser: friendId,
      postId,
    });

    if (alreadyReported) {
      console.warn("Duplicate report detected:", {
        reporter: userId,
        reportedUser: friendId,
        postId,
      });
      return errorResponse(res, 409, "You have already reported this post.");
    }

    console.log("Creating new report:", {
      reporter: userId,
      reportedUser: friendId,
      postId,
      reason,
    });
    const report = new Report({
      reporter: userId,
      reportedUser: friendId,
      postId,
      reason,
    });

    await report.save();
    console.log("Report saved successfully:", { reportId: report._id });

    console.log("Updating feed to hide post:", { user: userId, postId });
    await Feed.findOneAndUpdate(
      { user: userId },
      { $addToSet: { hiddenPosts: postId } },
      { upsert: true }
    );
    console.log("Feed updated successfully for user:", { userId });

    return successResponse(res, 200, "User and post reported successfully.");
  } catch (err) {
    console.error("Error in reportUserPost:", {
      error: err.message,
      stack: err.stack,
      userId,
      friendId,
      postId,
      reason,
    });
    return errorResponse(res, 500, "Internal Server Error");
  }
};

module.exports = { reportUserPost };
