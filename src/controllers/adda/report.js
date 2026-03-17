const Conversations = require("../../models/adda/conversation");
const GroupMessage = require("../../models/adda/GroupMessageSchema");
const Group = require("../../models/adda/groups");
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
        "Report reason, post ID, and user ID are required.",
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
      { upsert: true },
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
  const { contentId, reason, type, reportedUser } = req.body;
  const userId = req.user;

  console.log("🛑 Report initiated:", {
    userId,
    contentId,
    reason,
    type,
    reportedUser,
  });

  try {
    // ✅ 1. Basic validation
    if (!reason || !contentId || !type || !reportedUser) {
      return errorResponse(res, 400, "Missing required fields.");
    }

    let conversationId = null;
    let groupMessageId = null;

    if (type === "conversation") {
      const conversation = await Conversations.findById(contentId);

      if (!conversation) {
        return errorResponse(res, 404, "Conversation not found.");
      }

      if (!conversation.members.includes(userId)) {
        return errorResponse(res, 403, "Access denied.");
      }

      conversationId = contentId;
    } else if (type === "groupMessage") {
      const message = await GroupMessage.findById(contentId);

      if (!message) {
        return errorResponse(res, 404, "Message not found.");
      }

      const group = await Group.findById(message.groupId);

      if (!group || !group.members.includes(userId)) {
        return errorResponse(res, 403, "Access denied.");
      }

      groupMessageId = contentId;
    } else {
      return errorResponse(res, 400, "Invalid report type.");
    }

    // ✅ 3. Duplicate check (SAFE)
    const query = {
      reporter: userId,
      ...(conversationId && { conversationId }),
      ...(groupMessageId && { groupMessageId }),
    };

    const alreadyReported = await Report.findOne(query);

    if (alreadyReported) {
      return errorResponse(res, 409, "Already reported.");
    }

    // ✅ 4. Save report (ONLY valid field stored)
    const report = new Report({
      reporter: userId,
      reason,
      conversationId,
      groupMessageId,
      reportedUser,
    });

    await report.save();

    console.log("✅ Report saved:", report._id);

    return successResponse(res, 200, "Reported successfully.");
  } catch (err) {
    console.error("❌ Error reporting:", err);
    return errorResponse(res, 500, "Internal Server Error");
  }
};

module.exports = { reportUserPost, reportConversation };
