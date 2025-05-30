const express = require("express");
const router = express.Router();
const { conditionalAuth } = require("../../middlewares/auth.middleware");
const {
  getUserFeed,
  getSavedMemes,
  toggleSaveMeme,
  toggleFollowUser,
  updatePreferences,
  checkSavedMeme,
} = require("../../controllers/adda/memeFeed.controller");

// Get user's meme feed
router.get("/", getUserFeed);

// Get user's saved memes
router.get("/saved", conditionalAuth, getSavedMemes);

// Save or unsave a meme
router.post("/save/:memeId", conditionalAuth, toggleSaveMeme);

// Check if a meme is saved
router.get("/saved/:memeId", conditionalAuth, checkSavedMeme);

// Follow or unfollow a user
router.post("/follow/:targetUserId", conditionalAuth, toggleFollowUser);

// Update feed preferences
router.put("/preferences", conditionalAuth, updatePreferences);

module.exports = router;
