const mongoose = require("mongoose");

/**
 * Reaction Schema
 * Stores user reactions to different content types (posts, memes, etc.)
 */
const reactionSchema = new mongoose.Schema(
  {
    // User who made the reaction
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // Content type (post, meme, etc.)
    contentType: {
      type: String,
      required: true,
      enum: ["post", "meme", "comment"],
      index: true,
    },

    // ID of the content being reacted to
    contentId: {
      type: String,
      required: true,
      index: true,
    },

    // Type of reaction (like, love, laugh, angry, sad, fire)
    reactionType: {
      type: String,
      required: true,
      enum: ["like", "love", "laugh", "angry", "sad", "fire"],
      default: "like",
    },

    // Timestamp when reaction was created
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // Timestamp when reaction was last updated
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for efficient querying of reactions
reactionSchema.index(
  { userId: 1, contentType: 1, contentId: 1 },
  { unique: true }
);

/**
 * Static method to get reaction counts for a piece of content
 */
reactionSchema.statics.getReactionCounts = async function (
  contentType,
  contentId
) {
  const counts = await this.aggregate([
    {
      $match: {
        contentType: contentType,
        contentId: contentId.toString(),
      },
    },
    {
      $group: {
        _id: "$reactionType",
        count: { $sum: 1 },
      },
    },
  ]);

  // Create a result object with all possible reaction types initialized to 0
  const result = {
    like: 0,
    love: 0,
    laugh: 0,
    angry: 0,
    sad: 0,
    fire: 0,
  };

  // Update with actual counts
  counts.forEach((item) => {
    result[item._id] = item.count;
  });

  return result;
};

/**
 * Static method to check if a user has reacted to a piece of content
 */
reactionSchema.statics.getUserReaction = async function (
  userId,
  contentType,
  contentId
) {
  const reaction = await this.findOne({
    userId,
    contentType,
    contentId: contentId.toString(),
  });

  return reaction ? reaction.reactionType : null;
};

const Reaction = mongoose.model("Reaction", reactionSchema);

module.exports = Reaction;
