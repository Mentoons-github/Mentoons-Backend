const express = require("express");
const {
  fetchFeedback,
  feedbackSubmit,
  saveDisplayReviews,
} = require("../../controllers/adda/userFeedback");
const verifyToken = require("../../middlewares/addaMiddleware");
const { verifyAdmin } = require("../../middlewares/admin/adminAuth");

const router = express.Router();

router.route("/").get(fetchFeedback).post(verifyToken, feedbackSubmit);
router.patch("/display", verifyAdmin, saveDisplayReviews);

module.exports = router;
