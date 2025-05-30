const MemeFeed = require("../../models/adda/memeFeed");
const Meme = require("../../models/adda/meme");
const User = require("../../models/user");
const mongoose = require("mongoose");

/**
 * Get user's meme feed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    console.log("req user found :", !!req.user);

    // Set up sorting and filters
    const sortOptions = { createdAt: -1 };

    // Handle logged in users
    if (req.user && req.user.dbUser) {
      const userId = req.user.dbUser._id;

      // Find or create feed for user
      let feed = await MemeFeed.findOne({ user: userId });

      if (!feed) {
        feed = new MemeFeed({ user: userId });
        await feed.save();

        // Populate feed with recent public memes
        const recentMemes = await Meme.find({ visibility: "public" })
          .sort({ createdAt: -1 })
          .limit(20);

        if (recentMemes.length > 0) {
          feed.memes = recentMemes.map((meme) => meme._id);
          await feed.save();
        }
      }

      // If feed is empty, populate it with recent public memes
      if (!feed.memes || feed.memes.length === 0) {
        const recentMemes = await Meme.find({ visibility: "public" })
          .sort({ createdAt: -1 })
          .limit(20);

        if (recentMemes.length > 0) {
          feed.memes = recentMemes.map((meme) => meme._id);
          await feed.save();
        }
      }

      // Update lastViewedAt timestamp
      feed.lastViewedAt = Date.now();
      await feed.save();

      // Check for new memes that aren't in the feed yet
      const lastFeedUpdate = feed.updatedAt || feed.createdAt;
      const newMemes = await Meme.find({
        visibility: "public",
        createdAt: { $gt: lastFeedUpdate },
      }).sort({ createdAt: -1 });

      // Add new memes to the feed
      if (newMemes.length > 0) {
        const newMemeIds = newMemes.map((meme) => meme._id);
        feed.memes = [...newMemeIds, ...feed.memes];
        await feed.save();
      }

      // Prepare query to get feed memes
      const feedQuery = {
        $and: [
          { _id: { $in: feed.memes } },
          { user: { $nin: feed.blockedUsers || [] } },
        ],
      };

      // Filter by content types if specified in preferences
      if (feed.preferences?.contentTypes?.length > 0) {
        feedQuery.$and.push({ tags: { $in: feed.preferences.contentTypes } });
      }

      // Prioritize memes from followed users if enabled
      if (
        feed.preferences?.prioritizeFollowing &&
        feed.followingUsers?.length > 0
      ) {
        console.log("followers found in feed");
        console.log(feed.followingUsers);

        const followedUserIds = feed.followingUsers.map(
          (id) => new mongoose.Types.ObjectId(id)
        );

        const followedMemes = await Meme.aggregate([
          {
            $match: {
              user: { $in: followedUserIds },
              _id: {
                $in: feed.memes.map((id) => new mongoose.Types.ObjectId(id)),
              },
              user: { $nin: feed.blockedUsers || [] },
            },
          },
          {
            $addFields: { userFollowed: 1 },
          },
          { $sort: sortOptions },
        ]);

        const otherMemes = await Meme.aggregate([
          {
            $match: {
              visibility: "public",
              user: { $nin: followedUserIds },
              _id: {
                $in: feed.memes.map((id) => new mongoose.Types.ObjectId(id)),
              },
              user: { $nin: feed.blockedUsers || [] },
            },
          },
          {
            $addFields: { userFollowed: 0 },
          },
          { $sort: sortOptions },
        ]);

        const combinedMemes = [...followedMemes, ...otherMemes];
        const startIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const paginatedMemes = combinedMemes.slice(
          startIndex,
          startIndex + parseInt(limit, 10)
        );

        const populatedMemes = await Meme.populate(paginatedMemes, [
          { path: "user" },
          {
            path: "comments",
            populate: { path: "user" },
            options: { limit: 3 },
          },
        ]);

        return res.status(200).json({
          success: true,
          data: populatedMemes,
          pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            hasMore: combinedMemes.length > startIndex + parseInt(limit, 10),
          },
        });
      } else {
        console.log("followers not found in feed");

        // Standard pagination
        const options = {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          sort: sortOptions,
          populate: [
            { path: "user" },
            {
              path: "comments",
              populate: { path: "user" },
              options: { limit: 3 },
            },
          ],
        };

        const memes = await Meme.paginate(feedQuery, options);

        return res.status(200).json({
          success: true,
          data: memes.docs,
          pagination: {
            total: memes.totalDocs,
            page: memes.page,
            pages: memes.totalPages,
            limit: memes.limit,
          },
        });
      }
    } else {
      // For guest users (not logged in)
      const feedQuery = { visibility: "public" };

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sortOptions,
        populate: [
          { path: "user" },
          {
            path: "comments",
            populate: { path: "user" },
            options: { limit: 3 },
          },
        ],
      };

      const memes = await Meme.paginate(feedQuery, options);

      console.log("Guest user feed generated");

      return res.status(200).json({
        success: true,
        data: memes.docs,
        pagination: {
          total: memes.totalDocs,
          page: memes.page,
          pages: memes.totalPages,
          limit: memes.limit,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user's saved memes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSavedMemes = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { page = 1, limit = 10 } = req.query;

    const feed = await MemeFeed.findOne({ user: userId });
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Feed not found",
      });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: "user" },
        {
          path: "comments",
          populate: { path: "user" },
        },
      ],
    };

    const memes = await Meme.paginate(
      { _id: { $in: feed.savedMemes } },
      options
    );

    res.status(200).json({
      success: true,
      data: memes.docs,
      pagination: {
        total: memes.totalDocs,
        page: memes.page,
        pages: memes.totalPages,
        limit: memes.limit,
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
 * Save or unsave a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleSaveMeme = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { memeId } = req.params;

    const feed = await MemeFeed.findOne({ user: userId });
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Feed not found",
      });
    }

    const isSaved = feed.savedMemes.includes(memeId);
    if (isSaved) {
      await feed.unsaveMeme(memeId);
    } else {
      await feed.saveMeme(memeId);
    }

    res.status(200).json({
      success: true,
      message: isSaved
        ? "Meme unsaved successfully"
        : "Meme saved successfully",
      saved: !isSaved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Follow or unfollow a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const toggleFollowUser = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { targetUserId } = req.params;

    const feed = await MemeFeed.findOne({ user: userId });
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Feed not found",
      });
    }

    const isFollowing = feed.followingUsers.includes(targetUserId);
    if (isFollowing) {
      await feed.unfollowUser(targetUserId);
    } else {
      await feed.followUser(targetUserId);
    }

    res.status(200).json({
      success: true,
      message: isFollowing
        ? "User unfollowed successfully"
        : "User followed successfully",
      following: !isFollowing,
    });
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
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { contentTypes, prioritizeFollowing } = req.body;

    const feed = await MemeFeed.findOne({ user: userId });
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Feed not found",
      });
    }

    if (contentTypes) {
      feed.preferences.contentTypes = contentTypes;
    }
    if (prioritizeFollowing !== undefined) {
      feed.preferences.prioritizeFollowing = prioritizeFollowing;
    }

    await feed.save();

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: feed.preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const checkSavedMeme = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { memeId } = req.params;

    const feed = await MemeFeed.findOne({ user: userId });
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: "Feed not found",
      });
    }

    const isSaved = feed.savedMemes.includes(memeId);
    res.status(200).json({
      success: true,
      saved: isSaved,
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
  getSavedMemes,
  toggleSaveMeme,
  toggleFollowUser,
  updatePreferences,
  checkSavedMeme,
};
