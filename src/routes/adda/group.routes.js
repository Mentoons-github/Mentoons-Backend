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
} = require("../../controllers/adda/groupController");

// -------------------- GROUP ROUTES --------------------
router.get("/", fetchGroups);

router.get("/:groupId/members", fetchMembers);

router.get("/:groupId/messages", fetchGroupMessages);

router.get("/:groupId", fetchGroupById);

// -------------------- POLL ROUTES --------------------
router.get("/:groupId/polls", fetchPolls);

router.post("/:groupId/polls", createPoll);

router.post("/:groupId/polls/:pollId/vote", votePoll);

router.patch("/:groupId/polls/:pollId/close", closePoll);

module.exports = router;
