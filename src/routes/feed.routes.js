const express = require("express");
const router = express.Router();
const {
  getUserFeed,
  updateFeedPreferences,
  hidePost,
  savePost,
  unsavePost,
  getSavedPosts,
  checkSavedPost,
} = require("../controllers/feed.controller");
const { conditionalAuth } = require("../middlewares/auth.middleware");

// All feed routes require authentication
router.get("/", conditionalAuth, getUserFeed);
router.put("/preferences", conditionalAuth, updateFeedPreferences);
router.post("/posts/:postId/hide", conditionalAuth, hidePost);
router.post("/posts/:postId/save", conditionalAuth, savePost);
router.post("/posts/:postId/unsave", conditionalAuth, unsavePost);
router.get("/saved", conditionalAuth, getSavedPosts);
router.get("/posts/:postId/check-saved", conditionalAuth, checkSavedPost);

module.exports = router;
