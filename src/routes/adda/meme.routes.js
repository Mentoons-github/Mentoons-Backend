const express = require("express");
const router = express.Router();
const {
  createMeme,
  getAllMemes,
  getMemeById,
  updateMeme,
  deleteMeme,
  likeMeme,
  getMemesByUser,
  addComment,
  removeComment,
  shareMeme,
  toggleSaveMeme,
  getSavedMemes,
  getLikesByTarget,
  getCommentsByTarget,
  updateComment,
  likeComment,
} = require("../../controllers/adda/meme.controller");
const { conditionalAuth } = require("../../middlewares/auth.middleware");

/**
 * @route   GET /api/memes
 * @desc    Get all public memes with pagination and sorting
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} sortBy - Field to sort by (createdAt, title, likes, comments)
 * @query   {string} sortOrder - Sort direction (asc, desc)
 */
router.get("/", getAllMemes);

/**
 * @route   GET /api/memes/:memeId
 * @desc    Get a specific meme by ID
 * @access  Public
 */
router.get("/:memeId", getMemeById);

/**
 * @route   GET /api/memes/user/:userId
 * @desc    Get memes by user ID
 * @access  Protected
 */
router.get("/user/:userId", conditionalAuth, getMemesByUser);

/**
 * @route   GET /api/memes/saved
 * @desc    Get user's saved memes
 * @access  Protected
 */
router.get("/saved", conditionalAuth, getSavedMemes);

/**
 * @route   POST /api/memes
 * @desc    Create a new meme
 * @access  Protected
 * @body    {string} title - Meme title
 * @body    {string} image - Image URL
 * @body    {string} description - Meme description
 * @body    {string[]} tags - Array of tags
 * @body    {string} visibility - Visibility level (public|friends|private)
 */
router.post("/", conditionalAuth, createMeme);

/**
 * @route   PUT /api/memes/:id
 * @desc    Update a meme
 * @access  Protected
 */
router.put("/:id", conditionalAuth, updateMeme);

/**
 * @route   DELETE /api/memes/:id
 * @desc    Delete a meme
 * @access  Protected
 */
router.delete("/:id", conditionalAuth, deleteMeme);

/**
 * @route   GET /api/memes/:id/likes
 * @desc    Get all likes for a meme
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 */
router.get("/:id/likes", getLikesByTarget);

/**
 * @route   POST /api/memes/:id/likes
 * @desc    Like a meme
 * @access  Protected
 */
router.post("/:memeId/likes", conditionalAuth, likeMeme);

/**
 * @route   DELETE /api/memes/:id/likes
 * @desc    Unlike a meme
 * @access  Protected
 */
router.delete("/:memeId/likes", conditionalAuth, likeMeme);

/**
 * @route   GET /api/memes/:id/comments
 * @desc    Get all comments for a meme
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} sortBy - Field to sort by (createdAt, likes)
 * @query   {string} sortOrder - Sort direction (asc, desc)
 */
router.get("/:id/comments", getCommentsByTarget);

/**
 * @route   POST /api/memes/:id/comments
 * @desc    Add a comment to a meme
 * @access  Protected
 * @body    {string} content - Comment text
 * @body    {Object[]} media - Array of media objects
 * @body    {string} media[].url - Media URL
 * @body    {string} media[].type - Media type (image|video|gif)
 * @body    {string} parentCommentId - ID of parent comment (for replies)
 * @body    {string[]} mentions - Array of mentioned user IDs
 */
router.post("/:id/comments", conditionalAuth, addComment);

/**
 * @route   PUT /api/memes/:id/comments/:commentId
 * @desc    Update a comment
 * @access  Protected
 * @body    {string} content - Updated comment text
 * @body    {Object[]} media - Updated array of media objects
 */
router.put("/:id/comments/:commentId", conditionalAuth, updateComment);

/**
 * @route   DELETE /api/memes/:id/comments/:commentId
 * @desc    Remove a comment from a meme
 * @access  Protected
 */
router.delete("/:id/comments/:commentId", conditionalAuth, removeComment);

/**
 * @route   POST /api/memes/:id/comments/:commentId/likes
 * @desc    Like a comment
 * @access  Protected
 */
router.post("/:id/comments/:commentId/likes", conditionalAuth, likeComment);

/**
 * @route   DELETE /api/memes/:id/comments/:commentId/likes
 * @desc    Unlike a comment
 * @access  Protected
 */
router.delete("/:id/comments/:commentId/likes", conditionalAuth, likeComment);

/**
 * @route   POST /api/memes/:id/save
 * @desc    Save/unsave a meme
 * @access  Protected
 */
router.post("/:memeId/save", conditionalAuth, toggleSaveMeme);

/**
 * @route   POST /api/memes/:id/share
 * @desc    Share a meme
 * @access  Protected
 * @body    {string} caption - Share caption
 * @body    {string} visibility - Visibility level (public|friends|private)
 * @body    {string} shareType - Type of share (timeline|direct|external)
 * @body    {string[]} recipients - Array of recipient user IDs
 * @body    {string} externalPlatform - External platform (facebook|twitter|whatsapp|email|other)
 */
router.post("/:memeId/share", conditionalAuth, shareMeme);

module.exports = router;
