const Meme = require("../../models/adda/meme");
const User = require("../../models/user");
const Comment = require("../../models/comment");
const Share = require("../../models/share");
const Like = require("../../models/like");
const MemeFeed = require("../../models/adda/memeFeed");
const mongoose = require("mongoose");

/**
 * Create a new meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMeme = async (req, res) => {
  try {
    const { title, image, description, tags, visibility } = req.body;

    const user = await User.findOne({ _id: req.user.dbUser._id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newMeme = new Meme({
      user: user._id,
      title,
      image,
      description,
      tags,
      visibility,
    });

    const savedMeme = await newMeme.save();

    // Add meme to relevant feeds if it's public
    if (visibility === "public") {
      await MemeFeed.addMemeToFeeds(savedMeme._id, user._id);
    }

    await savedMeme.populate("user");

    res.status(201).json({
      success: true,
      data: savedMeme,
      message: "Meme created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all memes with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMemes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      tags = "",
    } = req.query;

    // Validate sort parameters
    const validSortFields = ["createdAt", "title", "likes", "comments"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortDirection;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOptions,
      populate: [
        { path: "user", select: "email picture name" },
        {
          path: "comments",
          populate: { path: "user", select: "email picture name" },
          select: "content createdAt user likes replies media",
        },
      ],
    };

    // Build query
    const query = { visibility: "public" };

    // Add search condition if search term is provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add tags condition if tags are provided
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    const memes = await Meme.paginate(query, options);

    res.status(200).json({
      success: true,
      data: memes.docs,
      pagination: {
        total: memes.totalDocs,
        page: memes.page,
        pages: memes.totalPages,
        limit: memes.limit,
        sortBy: sortField,
        sortOrder: sortOrder,
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
 * Get a meme by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemeById = async (req, res) => {
  try {
    const { memeId } = req.params;

    const meme = await Meme.findById(memeId)
      .populate("user")
      .populate({
        path: "comments",
        populate: { path: "user" },
      });

    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    // Check if user has permission to view this meme
    if (meme.visibility !== "public" && !meme.user._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this meme",
      });
    }

    res.status(200).json({
      success: true,
      data: meme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMeme = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, description, tags, visibility } = req.body;

    const meme = await Meme.findById(id);

    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    // Check if user is the owner of the meme
    if (!meme.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this meme",
      });
    }

    // Update fields if provided
    if (title !== undefined) meme.title = title;
    if (image !== undefined) meme.image = image;
    if (description !== undefined) meme.description = description;
    if (tags !== undefined) meme.tags = tags;
    if (visibility !== undefined) meme.visibility = visibility;

    const updatedMeme = await meme.save();

    await updatedMeme.populate("user", "email picture name");

    res.status(200).json({
      success: true,
      data: updatedMeme,
      message: "Meme updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMeme = async (req, res) => {
  try {
    const { id } = req.params;

    const meme = await Meme.findById(id);

    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    // Check if user is the owner of the meme
    if (!meme.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this meme",
      });
    }

    await Meme.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Meme deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Like or unlike a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const likeMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const userId = req.user.dbUser._id;

    const meme = await Meme.findById(memeId);

    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    // Check if user has already liked the meme
    const isLiked = meme.isLikedBy(userId);

    if (isLiked) {
      // Unlike the meme
      meme.likes = meme.likes.filter((like) => !like.equals(userId));
    } else {
      // Like the meme
      meme.likes.push(userId);
    }

    await meme.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: meme.likes.length,
      message: isLiked
        ? "Meme unliked successfully"
        : "Meme liked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get memes by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

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

    const query = { user: req.user.dbUser._id };

    // If viewing someone else's memes, only show public ones
    if (!req.user || !req.user.dbUser._id.equals(userId)) {
      query.visibility = "public";
    }

    const memes = await Meme.paginate(query, options);

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
 * Add a comment to a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, media } = req.body;
    const userId = req.user.dbUser._id;

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    // Create new comment
    const newComment = new Comment({
      user: userId,
      post: id,
      content,
      media,
    });

    const savedComment = await newComment.save();
    await meme.addComment(savedComment._id);

    // Populate user info in the comment
    await savedComment.populate("user", "name picture email");

    res.status(201).json({
      success: true,
      data: savedComment,
      message: "Comment added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Remove a comment from a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.dbUser._id;

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment owner or meme owner
    if (!comment.user.equals(userId) && !meme.user.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to remove this comment",
      });
    }

    await meme.removeComment(commentId);
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Comment removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Share a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const shareMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const { caption, visibility, shareType, recipients, externalPlatform } =
      req.body;
    const userId = req.user.dbUser._id;

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    // Create new share
    const newShare = new Share({
      user: userId,
      post: memeId,
      caption,
      visibility,
      shareType,
      recipients,
      externalPlatform,
    });

    const savedShare = await newShare.save();
    await meme.addShare(savedShare._id);

    res.status(201).json({
      success: true,
      data: savedShare,
      message: "Meme shared successfully",
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
    const { memeId } = req.params;
    const userId = req.user.dbUser._id;

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    const isSaved = meme.isSavedBy(userId);
    if (isSaved) {
      await meme.unsaveMeme(userId);
    } else {
      await meme.saveMeme(userId);
    }

    res.status(200).json({
      success: true,
      saved: !isSaved,
      saveCount: meme.saveCount,
      message: isSaved
        ? "Meme unsaved successfully"
        : "Meme saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get saved memes for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSavedMemes = async (req, res) => {
  try {
    const userId = req.user.dbUser._id;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: "user" },
        {
          path: "comments",
          populate: { path: "user" },
          options: { limit: 3 },
        },
      ],
    };

    const memes = await Meme.paginate({ saves: userId }, options);

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
 * Get all likes for a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLikesByTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: { path: "user" },
    };

    const likes = await Like.paginate({ meme: id }, options);

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
 * Get all comments for a meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommentsByTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    // Validate sort parameters
    const validSortFields = ["createdAt", "likes"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortField] = sortDirection;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOptions,
      populate: [
        { path: "user" },
        {
          path: "replies",
          populate: { path: "user" },
        },
      ],
    };

    const comments = await Comment.paginate(
      { meme: id, parentComment: null },
      options
    );

    res.status(200).json({
      success: true,
      data: comments.docs,
      pagination: {
        total: comments.totalDocs,
        page: comments.page,
        pages: comments.totalPages,
        limit: comments.limit,
        sortBy: sortField,
        sortOrder: sortOrder,
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
 * Update a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content, media } = req.body;
    const userId = req.user.dbUser._id;

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment owner
    if (!comment.user.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this comment",
      });
    }

    // Update comment
    if (content !== undefined) {
      comment.content = content;
      comment.isEdited = true;
    }
    if (media !== undefined) {
      comment.media = media;
    }

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
 * Like or unlike a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const likeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.dbUser._id;

    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user has already liked the comment
    const isLiked = comment.isLikedBy(userId);

    if (isLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter((like) => !like.equals(userId));
    } else {
      // Like the comment
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: comment.likes.length,
      message: isLiked
        ? "Comment unliked successfully"
        : "Comment liked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMeme,
  getAllMemes,
  getMemeById,
  updateMeme,
  deleteMeme,
  likeMeme,
  getMemesByUser,
  addComment,
  removeComment,
  shareMeme,
  toggleSaveMeme,
  getSavedMemes,
  getLikesByTarget,
  getCommentsByTarget,
  updateComment,
  likeComment,
};
