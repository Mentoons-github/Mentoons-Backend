const Meme = require("../../models/adda/meme");
const User = require("../../models/user");
const mongoose = require("mongoose");

/**
 * Create a new meme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMeme = async (req, res) => {
  try {
    const { title, image, description, tags, visibility } = req.body;

    const user = await User.findOne({ clerkId: req.user.id });

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

    await savedMeme.populate("user", "email picture name");

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

    const query = { visibility: "public" };

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
    const { id } = req.params;
    const userId = req.user._id;

    const meme = await Meme.findById(id);

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

module.exports = {
  createMeme,
  getAllMemes,
  getMemeById,
  updateMeme,
  deleteMeme,
  likeMeme,
  getMemesByUser,
};
