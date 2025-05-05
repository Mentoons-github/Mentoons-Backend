const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getPostsByUser,
} = require("../controllers/post.controller");
const {
  validatePostCreation,
  validatePostId,
} = require("../middlewares/post.middlewares");
const { conditionalAuth } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", getAllPosts);
router.get("/:id", validatePostId, getPostById);
router.get("/user/:userId", getPostsByUser);

// Protected routes
router.post("/", conditionalAuth, createPost);
router.put("/:id", conditionalAuth, validatePostId, updatePost);
router.delete("/:id", conditionalAuth, validatePostId, deletePost);
router.post("/:id/like", conditionalAuth, validatePostId, likePost);

module.exports = router;
