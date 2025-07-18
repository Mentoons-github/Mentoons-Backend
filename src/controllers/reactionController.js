const { createNotification } = require("../helpers/adda/createNotification");
const meme = require("../models/adda/meme");
const Notification = require("../models/adda/notification");
const post = require("../models/post");
const Reaction = require("../models/Reaction");
const User = require("../models/user");

/**
 * Controller functions for handling reactions
 */
const reactionController = {
  /**
   * Add a reaction
   * POST /api/v1/reactions/add-reaction
   */
  addReaction: async (req, res) => {
    try {
      const { type, id, reactionType = "like" } = req.body;
      const user = req.user.dbUser.id; // Assumes authentication middleware sets req.user
      console.log("userID :", user);
      // Validate input
      if (!type || !id) {
        return res
          .status(400)
          .json({ message: "Content type and ID are required" });
      }

      // Check if valid reaction type
      const validReactionTypes = [
        "like",
        "love",
        "laugh",
        "angry",
        "sad",
        "fire",
      ];
      if (!validReactionTypes.includes(reactionType)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }

      await Reaction.findOneAndUpdate(
        { user: user, contentType: type, contentId: id },
        { reactionType },
        { upsert: true, new: true }
      );

      const reactionCounts = await Reaction.getReactionCounts(type, id);

      let contentDoc;
      let referenceModel;

      if (type === "post") {
        contentDoc = await post.findById(id).populate("user", "name");
        referenceModel = "Post";
      } else if (type === "meme") {
        contentDoc = await meme.findById(id).populate("user", "name");
        referenceModel = "Meme";
      } else {
        return res.status(400).json({ message: "Unsupported content type" });
      }

      if (!contentDoc) {
        return res.status(404).json({ message: `${type} not found` });
      }

      const initiatorUser = await User.findOne({ _id: user });
      const initiatorName = initiatorUser?.name || "Someone";

      if (String(contentDoc.user._id) !== String(user)) {
        const action =
          reactionType === "like" ? "liked" : `reacted (${reactionType}) to`;

        const message = `${initiatorName} ${action} your ${type}.`;

        const noti = await createNotification(
          contentDoc.user,
          "like",
          message,
          initiatorUser._id,
          id,
          referenceModel
        );

        console.log("notification created :", noti);
      }

      return res.status(200).json({
        message: "Reaction added successfully",
        reactionCounts,
        userReaction: reactionType,
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },

  removeReaction: async (req, res) => {
    try {
      const { type, id } = req.body;
      const userId = req.user.dbUser.id;

      if (!type || !id) {
        return res
          .status(400)
          .json({ message: "Content type and ID are required" });
      }

      const deletedReaction = await Reaction.findOneAndDelete({
        user: userId,
        contentType: type,
        contentId: id,
      });

      if (deletedReaction) {
        let contentDoc;
        let referenceModel;

        if (type === "post") {
          contentDoc = await post.findById(id);
          referenceModel = "Post";
        } else if (type === "meme") {
          contentDoc = await meme.findById(id);
          referenceModel = "Meme";
        }

        if (contentDoc) {
          await Notification.findOneAndDelete({
            userId: contentDoc.user,
            initiatorId: userId,
            referenceId: id,
            referenceModel,
            type: "like",
          });
        }
      }

      const reactionCounts = await Reaction.getReactionCounts(type, id);

      return res.status(200).json({
        message: "Reaction removed successfully",
        reactionCounts,
        userReaction: null,
      });
    } catch (error) {
      console.error("Error removing reaction:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },

  checkReaction: async (req, res) => {
    try {
      const { type, id } = req.query;
      const user = req.user.dbUser.id; // Assumes authentication middleware

      // Validate input
      if (!type || !id) {
        return res
          .status(400)
          .json({ message: "Content type and ID are required" });
      }

      // Get the user's reaction if any
      const userReaction = await Reaction.getUserReaction(user, type, id);

      // Get reaction counts
      const reactionCounts = await Reaction.getReactionCounts(type, id);

      // Return response with reaction status and counts
      return res.status(200).json({
        userReaction,
        reactionCounts,
        // Include backward compatibility fields
        liked: !!userReaction,
        likeCount: Object.values(reactionCounts).reduce(
          (sum, count) => sum + count,
          0
        ),
      });
    } catch (error) {
      console.error("Error checking reaction:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },

  /**
   * Get users who reacted to content
   * GET /api/v1/reactions/get-reactions
   */
  getReactions: async (req, res) => {
    try {
      const { type, id } = req.query;

      // Validate input
      if (!type || !id) {
        return res
          .status(400)
          .json({ message: "Content type and ID are required" });
      }

      // Find all reactions for this content
      const reactions = await Reaction.find({
        contentType: type,
        contentId: id,
      })
        .select("user reactionType createdAt")
        .populate("user", "email picture name")
        .sort("-createdAt");

      // Get reaction counts
      const reactionCounts = await Reaction.getReactionCounts(type, id);

      // Return reaction data
      return res.status(200).json({
        reactions,
        reactionCounts,
        total: reactions.length,
      });
    } catch (error) {
      console.error("Error getting reactions:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  },
};

module.exports = reactionController;
