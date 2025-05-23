const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");
const { conditionalAuth } = require("../middlewares/auth.middleware");

/**
 * Reaction routes
 * Base path: /api/v1/reactions
 */

// Add a reaction - POST /api/v1/reactions/add-reaction
router.post("/add-reaction", conditionalAuth, reactionController.addReaction);

// Remove a reaction - POST /api/v1/reactions/remove-reaction
router.post("/remove-reaction", conditionalAuth, reactionController.removeReaction);

// Check if user has reacted - GET /api/v1/reactions/check-reaction
router.get("/check-reaction", conditionalAuth, reactionController.checkReaction);

// Get all reactions for content - GET /api/v1/reactions/get-reactions
router.get("/get-reactions", conditionalAuth, reactionController.getReactions);

module.exports = router;
