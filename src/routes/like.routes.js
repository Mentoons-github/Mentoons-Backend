const express = require("express");
const router = express.Router();
const {
  createLike,
  deleteLike,
  getLikesByPost,
  checkLike,
} = require("../controllers/like.controller");
const { conditionalAuth } = require("../middlewares/auth.middleware");

// Public routes
router.get("/posts/likes", getLikesByPost);

// Protected routes
router.post("/posts/like", conditionalAuth, createLike);
router.delete("/posts/unlike", conditionalAuth, deleteLike);
router.get("/posts/like/check", conditionalAuth, checkLike);

module.exports = router;
