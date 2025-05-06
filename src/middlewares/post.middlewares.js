const Post = require("../models/post");
const mongoose = require("mongoose");

/**
 * Middleware to validate post creation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validatePostCreation = (req, res, next) => {
  const {
    postType,
    content,
    title,
    media,
    article,
    event,
    tags,
    location,
    visibility,
  } = req.body;

  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }

  // Validate required fields
  if (!postType) {
    return res.status(400).json({
      success: false,
      message: "Post type is required",
    });
  }

  // Validate post type
  const validPostTypes = ["text", "photo", "video", "article", "event"];
  if (!validPostTypes.includes(postType)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid post type. Must be one of: text, photo, video, article, event",
    });
  }

  // Validate content based on post type
  if (postType === "text" && !content) {
    return res.status(400).json({
      success: false,
      message: "Content is required for text posts",
    });
  }

  if (postType === "photo" || postType === "video") {
    if (!media || !Array.isArray(media) || media.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Media is required for ${postType} posts`,
      });
    }

    // Validate media items
    for (const item of media) {
      if (!item.url) {
        return res.status(400).json({
          success: false,
          message: "URL is required for each media item",
        });
      }

      if (item.type && !["image", "video"].includes(item.type)) {
        return res.status(400).json({
          success: false,
          message: "Media type must be either image or video",
        });
      }
    }
  }

  if (postType === "article") {
    if (!article || !article.body) {
      return res.status(400).json({
        success: false,
        message: "Article body is required for article posts",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required for article posts",
      });
    }
  }

  if (postType === "event") {
    if (!event || !event.startDate || !event.venue) {
      return res.status(400).json({
        success: false,
        message: "Start date and venue are required for event posts",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required for event posts",
      });
    }

    // Validate dates
    const startDate = new Date(event.startDate);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date format",
      });
    }

    if (event.endDate) {
      const endDate = new Date(event.endDate);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date format",
        });
      }

      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be before start date",
        });
      }
    }
  }

  // Validate visibility if provided
  if (visibility && !["public", "friends", "private"].includes(visibility)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid visibility option. Must be one of: public, friends, private",
    });
  }

  // Validate tags if provided
  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({
      success: false,
      message: "Tags must be an array",
    });
  }

  next();
};

/**
 * Middleware to validate post ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validatePostId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid post ID",
    });
  }

  next();
};

module.exports = {
  validatePostCreation,
  validatePostId,
};
