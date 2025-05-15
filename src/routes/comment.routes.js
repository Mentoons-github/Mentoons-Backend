const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByTarget,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentReplies,
} = require("../controllers/comment.controllers");
const {
  validateCommentCreation,
} = require("../middlewares/comment.middleware");
const { conditionalAuth } = require("../middlewares/auth.middleware");

// Create a new comment
router.post("/", conditionalAuth, validateCommentCreation, createComment);

// Get all comments for a post
router.get("/post/:postId", getCommentsByTarget);

// Get all comments for a meme
router.get("/meme/:memeId", getCommentsByTarget);

// Get a single comment by ID
router.get("/:commentId", getCommentById);

// Update a comment
router.put("/:commentId", conditionalAuth, updateComment);

// Delete a comment
router.delete("/:commentId", conditionalAuth, deleteComment);

// Like a comment
router.post("/:commentId/like", conditionalAuth, likeComment);

// Unlike a comment
router.post("/:commentId/unlike", conditionalAuth, unlikeComment);

// Get replies for a comment
router.get("/:commentId/replies", getCommentReplies);

module.exports = router;
