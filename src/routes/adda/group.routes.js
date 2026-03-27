const express = require("express");
const router = express.Router();
const {
  fetchGroups,
  fetchMembers,
  fetchGroupMessages,
  fetchPolls,
  createPoll,
  votePoll,
  closePoll,
  fetchGroupById,
  joinGroups,
  createCommunityGroups,
  approveGroup,
  rejectGroup,
  deleteGroup,
} = require("../../controllers/adda/groupController");
const verifyToken = require("../../middlewares/addaMiddleware");
const { conditionalAuth } = require("../../middlewares/auth.middleware");
const adminAuthMiddleware = require("../../middlewares/adminAuthMiddleware");

// -------------------- GROUP ROUTES --------------------
router.get("/", conditionalAuth, fetchGroups);

router.get("/:groupId/members", verifyToken, fetchMembers);

router.get("/:groupId/messages", verifyToken, fetchGroupMessages);

router.get("/:groupId", fetchGroupById);

router.put("/:groupId/join", verifyToken, joinGroups);

router.post("/create", conditionalAuth, createCommunityGroups);

// -------------------- ADMIN GROUP MANAGEMENT ROUTES --------------------
router.put(
  "/:groupId/approve",
  adminAuthMiddleware.adminAuthMiddleware,
  approveGroup,
);
router.put(
  "/:groupId/reject",
  adminAuthMiddleware.adminAuthMiddleware,
  rejectGroup,
);
router.delete(
  "/:groupId",
  adminAuthMiddleware.adminAuthMiddleware,
  deleteGroup,
);

// -------------------- POLL ROUTES --------------------
router.get("/:groupId/polls", fetchPolls);

router.post("/:groupId/polls", createPoll);

router.post("/:groupId/polls/:pollId/vote", votePoll);

router.patch("/:groupId/polls/:pollId/close", closePoll);

module.exports = router;
