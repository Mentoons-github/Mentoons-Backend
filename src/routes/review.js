const express = require("express");
const {
  createReviewController,
  updateReviewController,
  deleteReviewController,
} = require("../controllers/reviewController.js");
const { requireAuth } = require("@clerk/express");

const router = express.Router();

router.post(
  "/review",
  requireAuth({ signInUrl: "/sign-in" }),
  createReviewController
);

router
  .route("/:reviewId")
  .patch(requireAuth({ signInUrl: "/sign-url" }), updateReviewController)
  .delete(requireAuth({ signInUrl: "/sign-in" }), deleteReviewController);

module.exports = router;
