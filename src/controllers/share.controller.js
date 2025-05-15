const Share = require("../models/share");
const Post = require("../models/post");
const Meme = require("../models/adda/meme");
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
      memeId,
      caption,
      visibility,
      shareType,
      recipients,
      externalPlatform,
    } = req.body;
    const userId = req.user.dbUser._id;

    // Validate that either postId or memeId is provided
    if (!postId && !memeId) {
      return res.status(400).json({
        success: false,
        message: "Either postId or memeId must be provided",
      });
    }

    if (postId && memeId) {
      return res.status(400).json({
        success: false,
        message: "Cannot share both post and meme at the same time",
      });
    }

    let content;
    let contentId;
    let contentModel;

    if (postId) {
      content = await Post.findById(postId);
      contentId = postId;
      contentModel = Post;
    } else {
      content = await Meme.findById(memeId);
      contentId = memeId;
      contentModel = Meme;
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: postId ? "Post not found" : "Meme not found",
      });
    }

    // Create new share
    const newShare = new Share({
      user: userId,
      post: postId,
      meme: memeId,
      caption,
      visibility,
      shareType,
      recipients,
      externalPlatform,
    });

    const savedShare = await newShare.save();

    // Update content shares array
    await contentModel.findByIdAndUpdate(contentId, {
      $push: { shares: savedShare._id },
    });

    res.status(201).json({
      success: true,
      data: savedShare,
      message: postId ? "Post shared successfully" : "Meme shared successfully",
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
    const userId = req.user.dbUser._id;

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

    // Update content shares array
    if (share.post) {
      await Post.findByIdAndUpdate(share.post, {
        $pull: { shares: shareId },
      });
    } else if (share.meme) {
      await Meme.findByIdAndUpdate(share.meme, {
        $pull: { shares: shareId },
      });
    }

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
 * Get all shares for a post or meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSharesByContent = async (req, res) => {
  try {
    const { postId, memeId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!postId && !memeId) {
      return res.status(400).json({
        success: false,
        message: "Either postId or memeId must be provided",
      });
    }

    let content;
    let query;

    if (postId) {
      content = await Post.findById(postId);
      query = { post: postId };
    } else {
      content = await Meme.findById(memeId);
      query = { meme: memeId };
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: postId ? "Post not found" : "Meme not found",
      });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: { path: "user", select: "name picture email username" },
    };

    const shares = await Share.paginate(query, options);

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
        {
          path: "meme",
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
 * Get share statistics for a post or meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShareStats = async (req, res) => {
  try {
    const { postId, memeId } = req.params;

    if (!postId && !memeId) {
      return res.status(400).json({
        success: false,
        message: "Either postId or memeId must be provided",
      });
    }

    let content;
    let query;

    if (postId) {
      content = await Post.findById(postId);
      query = { post: postId };
    } else {
      content = await Meme.findById(memeId);
      query = { meme: memeId };
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: postId ? "Post not found" : "Meme not found",
      });
    }

    // Get share count
    const shareCount = await Share.countDocuments(query);

    // Get share type distribution
    const shareTypeStats = await Share.aggregate([
      { $match: query },
      { $group: { _id: "$shareType", count: { $sum: 1 } } },
    ]);

    // Get external platform distribution
    const platformStats = await Share.aggregate([
      {
        $match: {
          ...query,
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
  getSharesByContent,
  getSharesByUser,
  getShareStats,
};
