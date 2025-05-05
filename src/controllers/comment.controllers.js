const Comment = require("../models/comment");
const Post = require("../models/post");
const mongoose = require("mongoose");

/**
 * Create a new comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId, mentions, media } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Create new comment
    const newComment = new Comment({
      user: userId,
      post: postId,
      content,
      mentions: mentions || [],
      media: media || [],
    });

    // If it's a reply, add the parent comment reference
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
      newComment.parentComment = parentCommentId;

      // Add this comment to the parent's replies
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: newComment._id },
      });
    }

    const savedComment = await newComment.save();

    // Populate user information
    await savedComment.populate("user", "name picture email");

    // Update post comments count
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    res.status(201).json({
      success: true,
      data: savedComment,
      message: "Comment created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all comments for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommentsByPost = async (req, res) => {
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

    // Get top-level comments (no parent)
    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate("user", "name picture email")
      .populate({
        path: "replies",
        populate: { path: "user", select: "name picture email" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalComments = await Comment.countDocuments({
      post: postId,
      parentComment: null,
    });

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        total: totalComments,
        page: parseInt(page),
        pages: Math.ceil(totalComments / limit),
        limit: parseInt(limit),
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
 * Get a single comment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate("user", "name picture email")
      .populate({
        path: "replies",
        populate: { path: "user", select: "name picture email" },
      });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, media, mentions } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the owner of the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this comment",
      });
    }

    // Update comment fields
    comment.content = content || comment.content;
    comment.media = media || comment.media;
    comment.mentions = mentions || comment.mentions;
    comment.isEdited = true;
    comment.updatedAt = Date.now();

    const updatedComment = await comment.save();
    await updatedComment.populate("user", "name picture email");

    res.status(200).json({
      success: true,
      data: updatedComment,
      message: "Comment updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the owner of the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // If it's a parent comment, delete all replies
    if (comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // If it's a reply, remove it from parent's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId },
      });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Update post comments count
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Like a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user already liked the comment
    if (comment.isLikedBy(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this comment",
      });
    }

    // Add user to likes array
    comment.likes.push(userId);
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment liked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Unlike a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user has liked the comment
    if (!comment.isLikedBy(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have not liked this comment",
      });
    }

    // Remove user from likes array
    comment.likes = comment.likes.filter((like) => !like.equals(userId));
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment unliked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get replies for a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Get replies for the comment
    const replies = await Comment.find({ parentComment: commentId })
      .populate("user", "name picture email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalReplies = await Comment.countDocuments({
      parentComment: commentId,
    });

    res.status(200).json({
      success: true,
      data: replies,
      pagination: {
        total: totalReplies,
        page: parseInt(page),
        pages: Math.ceil(totalReplies / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentReplies,
};
