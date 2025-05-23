const Reaction = require("../models/Reaction");


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
      const userId = req.user.id; // Assumes authentication middleware sets req.user

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

      // Upsert the reaction (create or update)
      await Reaction.findOneAndUpdate(
        { userId, contentType: type, contentId: id },
        { reactionType },
        { upsert: true, new: true }
      );

      // Get updated reaction counts
      const reactionCounts = await Reaction.getReactionCounts(type, id);

      // Return success response with updated counts
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

  /**
   * Remove a reaction
   * POST /api/v1/reactions/remove-reaction
   */
  removeReaction: async (req, res) => {
    try {
      const { type, id } = req.body;
      const userId = req.user.id; // Assumes authentication middleware

      // Validate input
      if (!type || !id) {
        return res
          .status(400)
          .json({ message: "Content type and ID are required" });
      }

      // Remove the reaction
      await Reaction.findOneAndDelete({
        userId,
        contentType: type,
        contentId: id,
      });

      // Get updated reaction counts
      const reactionCounts = await Reaction.getReactionCounts(type, id);

      // Return success response with updated counts
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

  /**
   * Check if user has reacted to content
   * GET /api/v1/reactions/check-reaction
   */
  checkReaction: async (req, res) => {
    try {
      const { type, id } = req.query;
      const userId = req.user.id; // Assumes authentication middleware

      // Validate input
      if (!type || !id) {
        return res
          .status(400)
          .json({ message: "Content type and ID are required" });
      }

      // Get the user's reaction if any
      const userReaction = await Reaction.getUserReaction(userId, type, id);

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
        .select("userId reactionType createdAt")
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
