const express = require("express");
const { verifyAdmin } = require("../../middlewares/admin/adminAuth");
const {
  fetchSessions,
} = require("../../controllers/admin/sessionCallController");

const router = express.Router();

router.get("/", verifyAdmin, fetchSessions);

module.exports = router;
