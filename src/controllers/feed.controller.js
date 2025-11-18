const Feed = require("../models/feed");
const Post = require("../models/post");
const mongoose = require("mongoose");

const getUserFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const sortOptions = { createdAt: -1 };

    if (req.user && req.user.dbUser) {
      const userId = req.user.dbUser._id;

      let userFeed = await Feed.findOne({ user: userId });

      if (!userFeed) {
        userFeed = new Feed({ user: userId });
        await userFeed.save();
      }

      userFeed.lastViewedAt = Date.now();
      await userFeed.save();

      const feedQuery = {
        $and: [
          { user: { $nin: userFeed.blockedUsers } },
          { _id: { $nin: userFeed.hiddenPosts } },
        ],
      };

      if (
        userFeed.preferences.prioritizeFollowing &&
        userFeed.followingUsers.length > 0
      ) {
        const followedUserIds = userFeed.followingUsers.map(
          (id) => new mongoose.Types.ObjectId(id)
        );

        const followedPosts = await Post.aggregate([
          {
            $match: {
              user: { $in: followedUserIds },
              _id: { $nin: userFeed.hiddenPosts },
              user: { $nin: userFeed.blockedUsers },
              $or: [{ visibility: "public" }, { visibility: "private" }],
            },
          },
          {
            $addFields: { userFollowed: 1 },
          },
          { $sort: sortOptions },
        ]);

        const publicPosts = await Post.aggregate([
          {
            $match: {
              visibility: "public",
              user: { $nin: followedUserIds },
              _id: { $nin: userFeed.hiddenPosts },
              user: { $nin: userFeed.blockedUsers },
            },
          },
          {
            $addFields: { userFollowed: 0 },
          },
          { $sort: sortOptions },
        ]);

        const combinedPosts = [...followedPosts, ...publicPosts];
        const startIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const paginatedPosts = combinedPosts.slice(
          startIndex,
          startIndex + parseInt(limit, 10)
        );

        const populatedPosts = await Post.populate(paginatedPosts, [
          { path: "user", select: "name username picture email" },
          {
            path: "comments",
            populate: { path: "user", select: "email picture name" },
            select: "content createdAt user likes replies media",
            options: { limit: 3 },
          },
          {
            path: "like",
            populate: { path: "user", select: "email picture name" },
            select: "user",
          },
          {
            path: "reactions",
            populate: { path: "user", select: "email picture name" },
            select: "user",
          },
          {
            path: "shares",
            populate: { path: "user", select: "email picture name" },
            select: "user",
          },
        ]);

        return res.status(200).json({
          success: true,
          data: populatedPosts,
          pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            hasMore: combinedPosts.length > startIndex + parseInt(limit, 10),
          },
        });
      } else {
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

        return res.status(200).json({
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
    } else {
      const feedQuery = { visibility: "public" };

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

      return res.status(200).json({
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
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

    let userFeed = await Feed.findOne({ user: userId });

    if (!userFeed) {
      userFeed = new Feed({
        user: userId,
      });
    }

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
