const express = require("express");
const { verifyAdmin } = require("../../middlewares/admin/adminAuth");
const {
  fetchSessions,
  updateSession,
} = require("../../controllers/admin/sessionCallController");

const router = express.Router();

router.get("/", verifyAdmin, fetchSessions);
router.patch("/:id", updateSession);

module.exports = router;
