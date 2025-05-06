const Share = require("../models/share");
const Post = require("../models/post");
const mongoose = require("mongoose");

/**
 * Create a new share
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createShare = async (req, res) => {
  try {
    const {
      postId,
      caption,
      visibility,
      shareType,
      recipients,
      externalPlatform,
    } = req.body;
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Create new share
    const newShare = new Share({
      user: userId,
      post: postId,
      caption,
      visibility,
      shareType,
      recipients,
      externalPlatform,
    });

    const savedShare = await newShare.save();

    // Update post shares array
    await Post.findByIdAndUpdate(postId, {
      $push: { shares: userId },
    });

    res.status(201).json({
      success: true,
      data: savedShare,
      message: "Post shared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a share
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user._id;

    // Check if share exists and belongs to user
    const share = await Share.findById(shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share not found",
      });
    }

    if (share.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this share",
      });
    }

    // Delete share
    await Share.findByIdAndDelete(shareId);

    // Update post shares array
    await Post.findByIdAndUpdate(share.post, {
      $pull: { shares: userId },
    });

    res.status(200).json({
      success: true,
      message: "Share deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all shares for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSharesByPost = async (req, res) => {
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
      populate: { path: "user", select: "name picture email username" },
    };

    const shares = await Share.paginate({ post: postId }, options);

    res.status(200).json({
      success: true,
      data: shares.docs,
      pagination: {
        total: shares.totalDocs,
        page: shares.page,
        pages: shares.totalPages,
        limit: shares.limit,
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
 * Get all shares by a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSharesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: [
        { path: "user", select: "name picture email username" },
        {
          path: "post",
          populate: { path: "user", select: "name picture email username" },
        },
      ],
      sort: { createdAt: -1 },
    };

    const shares = await Share.paginate({ user: userId }, options);

    res.status(200).json({
      success: true,
      data: shares.docs,
      pagination: {
        total: shares.totalDocs,
        page: shares.page,
        pages: shares.totalPages,
        limit: shares.limit,
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
 * Get share statistics for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShareStats = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Get share count
    const shareCount = await Share.countDocuments({ post: postId });

    // Get share type distribution
    const shareTypeStats = await Share.aggregate([
      { $match: { post: mongoose.Types.ObjectId(postId) } },
      { $group: { _id: "$shareType", count: { $sum: 1 } } },
    ]);

    // Get external platform distribution
    const platformStats = await Share.aggregate([
      {
        $match: {
          post: mongoose.Types.ObjectId(postId),
          externalPlatform: { $ne: null },
        },
      },
      { $group: { _id: "$externalPlatform", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalShares: shareCount,
        shareTypes: shareTypeStats,
        platforms: platformStats,
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
  createShare,
  deleteShare,
  getSharesByPost,
  getSharesByUser,
  getShareStats,
};
