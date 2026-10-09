const express = require("express");

const { conditionalAuth } = require("../middlewares/auth.middleware");
const {
  recordAssessmentAttempt,
  getAssessmentHistory,
} = require("../controllers/assessmentHostory");

const router = express.Router();

router.post("/", conditionalAuth, recordAssessmentAttempt);

router.get("/", conditionalAuth, getAssessmentHistory);

module.exports = router;
