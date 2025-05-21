const Like = require("../models/like");
const Post = require("../models/post");
const Meme = require("../models/adda/meme");

/**
 * Create a new like (for post or meme)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLike = async (req, res) => {
  try {
    const { type, id } = req.body; // type: 'post' or 'meme', id: postId or memeId
    const userId = req.user.dbUser._id;

    // Validate type
    if (type !== "post" && type !== "meme") {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'post' or 'meme'.",
      });
    }

    // Find the target document (post or meme)
    let targetModel = type === "post" ? Post : Meme;
    const targetDoc = await targetModel.findById(id);

    if (!targetDoc) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    // Check if like already exists
    const existingLike = await Like.findLike(userId, type, id);
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: `You have already liked this ${type}`,
      });
    }

    // Create new like in the Like collection
    const newLike = new Like({
      user: userId,
      [type]: id,
    });
    await newLike.save();

    // Update the target document based on type
    if (type === "post") {
      await Post.findByIdAndUpdate(id, {
        $push: { likes: userId },
      });
    } else if (type === "meme") {
      await Meme.findByIdAndUpdate(id, {
        $push: { likes: userId },
        $inc: { likeCount: 1 },
      });
    }

    res.status(201).json({
      success: true,
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } liked successfully`,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "You have already liked this item" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a like (unlike) for post or meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLike = async (req, res) => {
  try {
    const { type, id } = req.body; // type: 'post' or 'meme', id: postId or memeId
    const userId = req.user.dbUser._id;

    // Validate type
    if (type !== "post" && type !== "meme") {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'post' or 'meme'.",
      });
    }

    // Find the target document (post or meme)
    let targetModel = type === "post" ? Post : Meme;
    const targetDoc = await targetModel.findById(id);

    if (!targetDoc) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    // Find and remove the like
    const deletedLike = await Like.findOneAndDelete({
      user: userId,
      [type]: id,
    });

    if (!deletedLike) {
      return res
        .status(404)
        .json({ success: false, message: "Like not found" });
    }

    // Update the target document based on type
    if (type === "post") {
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: userId },
      });
    } else if (type === "meme") {
      await Meme.findByIdAndUpdate(id, {
        $pull: { likes: userId },
        $inc: { likeCount: -1 },
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Like removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all likes for a post or meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLikesByTarget = async (req, res) => {
  try {
    const { type, id } = req.query; // type: 'post' or 'meme', id: postId or memeId
    const { page = 1, limit = 10 } = req.query;

    let targetDoc;
    if (type === "post") {
      targetDoc = await Post.findById(id);
    } else if (type === "meme") {
      targetDoc = await Meme.findById(id);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'post' or 'meme'.",
      });
    }
    if (!targetDoc) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: { path: "user", select: "name picture email" },
    };
    const query = { [type]: id };
    const likes = await Like.paginate(query, options);

    res.status(200).json({
      success: true,
      data: likes.docs,
      pagination: {
        total: likes.totalDocs,
        page: likes.page,
        pages: likes.totalPages,
        limit: likes.limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check if user has liked a post or meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkLike = async (req, res) => {
  try {
    const { type, id } = req.query;
    const userId = req.user.dbUser._id;

    let targetDoc;
    if (type === "post") {
      targetDoc = await Post.findById(id);
    } else if (type === "meme") {
      targetDoc = await Meme.findById(id);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'post' or 'meme'.",
      });
    }
    if (!targetDoc) {
      return res.status(404).json({
        success: false,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    const like = await Like.findLike(userId, type, id);
    res.status(200).json({ success: true, liked: !!like });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLike,
  deleteLike,
  getLikesByTarget,
  checkLike,
};
