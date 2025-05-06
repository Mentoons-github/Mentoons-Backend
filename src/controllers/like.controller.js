const Like = require("../models/like");
const Post = require("../models/post");
const mongoose = require("mongoose");

/**
 * Create a new like
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.dbUser._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if like already exists
    const existingLike = await Like.findLike(userId, postId);
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this post",
      });
    }

    // Create new like
    const newLike = new Like({
      user: userId,
      post: postId,
    });

    const savedLike = await newLike.save();

    // Update post likes array
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: userId },
    });

    res.status(201).json({
      success: true,
      data: savedLike,
      message: "Post liked successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "You have already liked this post",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a like (unlike)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.dbUser._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Find and remove the like
    const deletedLike = await Like.findOneAndDelete({
      user: userId,
      post: postId,
    });

    if (!deletedLike) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    // Update post likes array
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    });

    res.status(200).json({
      success: true,
      message: "Like removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * Get all likes for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLikesByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: { path: "user", select: "name picture email" },
    };

    const likes = await Like.paginate({ post: postId }, options);

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Check if user has liked a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const like = await Like.findLike(userId, postId);

    res.status(200).json({
      success: true,
      liked: !!like,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createLike,
  deleteLike,
  getLikesByPost,
  checkLike,
};
