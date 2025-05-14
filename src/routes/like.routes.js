const express = require("express");
const router = express.Router();
const {
  createLike,
  deleteLike,
  getLikesByTarget,
  checkLike,
} = require("../controllers/like.controller");
const { conditionalAuth } = require("../middlewares/auth.middleware");

// Public routes
router.get("/get-likes", getLikesByTarget);

// Protected routes
router.post("/add-like", conditionalAuth, createLike);
router.post("/remove-like", conditionalAuth, deleteLike);
router.get("/check-like", conditionalAuth, checkLike);

module.exports = router;
