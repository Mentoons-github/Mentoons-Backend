const express = require("express");
const router = express.Router();
const {
  getUserFeed,
  updateFeedPreferences,
  hidePost,
  savePost,
  unsavePost,
  getSavedPosts,
} = require("../controllers/feed.controller");
const { conditionalAuth } = require("../middlewares/auth.middleware");

// All feed routes require authentication
router.get("/feed", conditionalAuth, getUserFeed);
router.put("/feed/preferences", conditionalAuth, updateFeedPreferences);
router.post("/feed/posts/:postId/hide", conditionalAuth, hidePost);
router.post("/feed/posts/:postId/save", conditionalAuth, savePost);
router.delete("/feed/posts/:postId/save", conditionalAuth, unsavePost);
router.get("/feed/saved", conditionalAuth, getSavedPosts);

module.exports = router;
