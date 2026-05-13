const express = require("express");
const adminAuthMiddleware = require("../../middlewares/adminAuthMiddleware");
const {
  badgeCreation,
  deleteBadge,
  getUserBadges,
  getAllBadges,
} = require("../../controllers/adda/badge");
const { conditionalAuth } = require("../../middlewares/auth.middleware");
const router = express.Router();

router.get("/", conditionalAuth, getUserBadges);

router.use(adminAuthMiddleware.adminAuthMiddleware);

router.get("/all", getAllBadges);

router.post("/add", badgeCreation);

router.route("/:id").delete(deleteBadge);

module.exports = router;
