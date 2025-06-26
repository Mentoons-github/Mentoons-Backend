const Conversations = require("../../models/adda/conversation");
const reportAndAbuse = require("../../models/adda/reportAndAbuse");
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

const reportConversation = async (req, res) => {
  const { conversationId, reason } = req.body;
  const userId = req.user;

  console.log("🛑 Conversation report initiated:", {
    userId,
    conversationId,
    reason,
  });

  try {
    // Validate inputs
    if (!reason || !conversationId) {
      console.error("Missing required fields:", { reason, conversationId });
      return errorResponse(
        res,
        400,
        "Report reason and conversation ID are required."
      );
    }

    // Check if the conversation exists and the user is a participant
    const conversation = await Conversations.findById(conversationId);
    if (!conversation || !conversation.members.includes(userId)) {
      return errorResponse(
        res,
        404,
        "Conversation not found or access denied."
      );
    }

    // Check for duplicate report
    const alreadyReported = await Report.findOne({
      reporter: userId,
      conversationId,
    });

    if (alreadyReported) {
      console.warn("Duplicate conversation report:", {
        reporter: userId,
        conversationId,
      });
      return errorResponse(
        res,
        409,
        "You have already reported this conversation."
      );
    }

    // Create the report without reportedUser
    const report = new reportAndAbuse({
      reporter: userId,
      conversationId,
      reason,
    });

    await report.save();
    console.log("✅ Conversation reported and saved:", {
      reportId: report._id,
    });

    console.log("🔕 Conversation hidden in feed for user:", { userId });

    return successResponse(res, 200, "Conversation reported successfully.");
  } catch (err) {
    console.error("❌ Error reporting conversation:", {
      error: err.message,
      stack: err.stack,
      userId,
      conversationId,
      reason,
    });
    return errorResponse(res, 500, "Internal Server Error");
  }
};

module.exports = { reportUserPost, reportConversation };
