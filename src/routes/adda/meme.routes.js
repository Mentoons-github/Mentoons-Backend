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
} = require("../../controllers/adda/meme.controller");
const { conditionalAuth } = require("../../middlewares/auth.middleware");

// Public routes
router.get("/", getAllMemes);
router.get("/:memeId", getMemeById);
router.get("/user/:userId", conditionalAuth, getMemesByUser);

// Protected routes
router.post("/", conditionalAuth, createMeme);
router.put("/:id", conditionalAuth, updateMeme);
router.delete("/:id", conditionalAuth, deleteMeme);
router.post("/:id/like", conditionalAuth, likeMeme);

module.exports = router;
