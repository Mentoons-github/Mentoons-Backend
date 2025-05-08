const Feed = require("../models/feed");
const Post = require("../models/post");
const User = require("../models/user");
const mongoose = require("mongoose");

/**
 * Get or initialize user feed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserFeed = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { page = 1, limit = 10 } = req.query;

    // Find or create feed for user
    let userFeed = await Feed.findOne({ user: userId });

    if (!userFeed) {
      // Initialize new feed if not exists
      userFeed = new Feed({
        user: userId,
      });
      await userFeed.save();
    }

    // Update last viewed time
    userFeed.lastViewedAt = Date.now();
    await userFeed.save();

    // Prepare query to get feed posts
    const feedQuery = {
      $and: [
        // Exclude posts from blocked users
        { user: { $nin: userFeed.blockedUsers } },
        // Exclude hidden posts
        { _id: { $nin: userFeed.hiddenPosts } },
      ],
    };

    // Filter by content types if specified in preferences
    if (userFeed.preferences.contentTypes.length > 0) {
      feedQuery.postType = { $in: userFeed.preferences.contentTypes };
    }

    // Set up sorting and filters
    const sortOptions = { createdAt: -1 };

    // Prioritize posts from followed users if enabled
    if (
      userFeed.preferences.prioritizeFollowing &&
      userFeed.followingUsers.length > 0
    ) {
      sortOptions.userFollowed = -1;
      // Using aggregation to add a field that helps sort followed users first
      const posts = await Post.aggregate([
        {
          $addFields: {
            userFollowed: {
              $cond: [
                {
                  $in: [
                    "$user",
                    userFeed.followingUsers.map((id) =>
                      mongoose.Types.ObjectId(id)
                    ),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
        { $match: feedQuery },
        { $sort: sortOptions },
        { $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) },
        { $limit: parseInt(limit, 10) },
      ]);

      // Populate the user and other references
      const populatedPosts = await Post.populate(posts, [
        { path: "user", select: "name username picture email" },
        {
          path: "comments",
          populate: { path: "user", select: "email picture name" },
          select: "content createdAt user likes replies media",
          options: { limit: 3 },
        },
      ]);

      return res.status(200).json({
        success: true,
        data: populatedPosts,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          hasMore: posts.length === parseInt(limit, 10),
        },
      });
    } else {
      // Standard pagination using mongoose-paginate
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sortOptions,
        populate: [
          { path: "user", select: "name username picture email" },
          {
            path: "comments",
            populate: { path: "user", select: "email picture name" },
            select: "content createdAt user likes replies media",
            options: { limit: 3 },
          },
        ],
      };

      const posts = await Post.paginate(feedQuery, options);

      res.status(200).json({
        success: true,
        data: posts.docs,
        pagination: {
          total: posts.totalDocs,
          page: posts.page,
          pages: posts.totalPages,
          limit: posts.limit,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update feed preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFeedPreferences = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const {
      showLikes,
      showComments,
      showShares,
      prioritizeFollowing,
      contentTypes,
      refreshRate,
    } = req.body;

    // Find or create feed for user
    let userFeed = await Feed.findOne({ user: userId });

    if (!userFeed) {
      userFeed = new Feed({
        user: userId,
      });
    }

    // Update preferences if provided
    if (showLikes !== undefined) userFeed.preferences.showLikes = showLikes;
    if (showComments !== undefined)
      userFeed.preferences.showComments = showComments;
    if (showShares !== undefined) userFeed.preferences.showShares = showShares;
    if (prioritizeFollowing !== undefined)
      userFeed.preferences.prioritizeFollowing = prioritizeFollowing;
    if (contentTypes && Array.isArray(contentTypes))
      userFeed.preferences.contentTypes = contentTypes;
    if (refreshRate !== undefined) userFeed.refreshRate = refreshRate;

    await userFeed.save();

    res.status(200).json({
      success: true,
      data: userFeed,
      message: "Feed preferences updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Hide a post from feed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const hidePost = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Find or create feed for user
    let userFeed = await Feed.findOne({ user: userId });

    if (!userFeed) {
      userFeed = new Feed({
        user: userId,
      });
    }

    // Add post to hidden posts if not already there
    if (!userFeed.isPostHidden(postId)) {
      userFeed.hiddenPosts.push(postId);
      await userFeed.save();
    }

    res.status(200).json({
      success: true,
      message: "Post hidden from feed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Save a post to feed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const savePost = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Find or create feed for user
    let userFeed = await Feed.findOne({ user: userId });

    if (!userFeed) {
      userFeed = new Feed({
        user: userId,
      });
    }

    // Add post to saved posts if not already there
    if (!userFeed.isPostSaved(postId)) {
      userFeed.savedPosts.push(postId);
      await userFeed.save();
    }

    res.status(200).json({
      success: true,
      message: "Post saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Unsave a post from feed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const unsavePost = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { postId } = req.params;

    // Find feed for user
    let userFeed = await Feed.findOne({ user: userId });

    if (!userFeed) {
      return res.status(404).json({
        success: false,
        message: "Feed not found",
      });
    }

    // Remove post from saved posts
    userFeed.savedPosts = userFeed.savedPosts.filter(
      (id) => !id.equals(postId)
    );
    await userFeed.save();

    res.status(200).json({
      success: true,
      message: "Post unsaved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get saved posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { page = 1, limit = 10 } = req.query;

    // Find feed for user
    let userFeed = await Feed.findOne({ user: userId });

    if (!userFeed) {
      return res.status(404).json({
        success: false,
        message: "Feed not found",
      });
    }

    // Get saved posts
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: "user", select: "name  picture email" },
        {
          path: "comments",
          populate: { path: "user", select: "email picture name" },
          select: "content createdAt user likes replies media",
        },
      ],
    };

    const posts = await Post.paginate(
      { _id: { $in: userFeed.savedPosts } },
      options
    );

    res.status(200).json({
      success: true,
      data: posts.docs,
      pagination: {
        total: posts.totalDocs,
        page: posts.page,
        pages: posts.totalPages,
        limit: posts.limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const checkSavedPost = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { postId } = req.params;
    const userFeed = await Feed.findOne({ user: userId });
    const isSaved = userFeed.savedPosts.includes(postId);
    res.status(200).json({
      success: true,
      data: isSaved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserFeed,
  updateFeedPreferences,
  hidePost,
  savePost,
  unsavePost,
  getSavedPosts,
  checkSavedPost,
};
