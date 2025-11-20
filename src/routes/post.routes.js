const express = require("express");
const router = express.Router();
const checkProfileCompletion = require("../middlewares/adda/profileCompletionCheck");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getPostsByUser,
  friendPost,
} = require("../controllers/post.controller");
const { validatePostId } = require("../middlewares/post.middlewares");
const { conditionalAuth } = require("../middlewares/auth.middleware");

router.get("/", getAllPosts);

router.get("/user/:userId?", conditionalAuth, getPostsByUser);

router.use(conditionalAuth);

router.get("/:postId", getPostById);

router.post("/", checkProfileCompletion, createPost);
router.put("/:id", validatePostId, updatePost);
router.delete("/:id", validatePostId, deletePost);
router.post("/:id/like", validatePostId, likePost);
router.get("/friends-post/:friendId", friendPost);

module.exports = router;
