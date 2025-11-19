const Post = require("../models/post");
const mongoose = require("mongoose");
const User = require("../models/user");

/**
 * Create a new post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPost = async (req, res) => {
  try {
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

    console.log(
      "req.body =========================================================================================>:",
      req.body
    );
    const user = await User.findOne({ clerkId: req.user.dbUser.clerkId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newPost = new Post({
      user: user._id,
      postType,
      content,
      title,
      media,
      article,
      event,
      tags,
      location,
      visibility,
    });

    const savedPost = await newPost.save();

    await savedPost.populate("user", "email picture name");

    res.status(201).json({
      success: true,
      data: savedPost,
      message: "Post created successfully",
    });
  } catch (error) {
    console.log("error found :", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all posts with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      postType,
      user,
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

    const query = {};

    if (postType) {
      query.postType = postType;
    }

    if (user) {
      query.user = user;
    }

    // Only show public posts or posts from friends
    // This would need to be expanded with friend logic
    query.visibility = "public";

    const posts = await Post.paginate(query, options);

    console.log(posts);

    res.status(200).json({
      success: true,
      data: posts.docs,
      pagination: {
        total: posts.totalDocs,
        page: posts.page,
        pages: posts.totalPages,
        limit: posts.limit,
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
 * Get a post by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log(postId);

    const post = await Post.findById(postId)
      .populate("user")
      .populate({
        path: "comments",
        populate: { path: "user" },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user has permission to view this post
    if (post.visibility !== "public" && !post.user._id.equals(req.user._id)) {
      // This would need to be expanded with friend logic for 'friends' visibility
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this post",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      content,
      title,
      media,
      article,
      event,
      tags,
      location,
      visibility,
    } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the owner of the post
    if (!post.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this post",
      });
    }

    // Update fields if provided
    if (content !== undefined) post.content = content;
    if (title !== undefined) post.title = title;
    if (media !== undefined) post.media = media;
    if (article !== undefined) post.article = article;
    if (event !== undefined) post.event = event;
    if (tags !== undefined) post.tags = tags;
    if (location !== undefined) post.location = location;
    if (visibility !== undefined) post.visibility = visibility;

    const updatedPost = await post.save();

    await updatedPost.populate("user", "email picture name");

    res.status(200).json({
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    console.log(req.user.dbUser._id);

    // Check if user is the owner of the post
    if (!post.user.equals(req.user.dbUser._id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this post",
      });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Like or unlike a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user has already liked the post
    const isLiked = post.isLikedBy(userId);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter((like) => !like.equals(userId));
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
      message: isLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { currentUser } = req.query;

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
    if (currentUser) {
    } else if (!req.user || !req.user.dbUser._id.equals(userId)) {
      query.visibility = "public";
    }

    const posts = await Post.paginate(query, options);

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

const friendPost = async (req, res) => {
  try {
    const { friendId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const friendsPost = await Post.find({ user: friendId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ user: friendId });
    const hasMore = page * limit < totalPosts;

    res.status(200).json({
      success: true,
      data: friendsPost,
      currentPage: page,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getPostsByUser,
  friendPost,
};
