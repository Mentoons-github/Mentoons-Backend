const reviewHelper = require("../helpers/reviewHelper");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  createReviewController: asyncHandler(async (req, res) => {
    const { rating, review, productId } = req.body;
    const { userId } = req.auth;

    console.log("Controler", { rating, review, productId, userId });

    if (!rating && !review && !productId && !userId) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const newReview = await reviewHelper.createReview(
      userId,
      productId,
      rating,
      review
    );

    console.log("Controller", newReview);

    if (!newReview) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_CREATED_REVIEW,
      newReview
    );
  }),

  updateReviewController: asyncHandler(async (req, res) => {
    const { reviewId, rating, review } = req.body;
    const { userId } = req.auth;

    console.log("Contoller", { reviewId, rating, review, userId });

    if (!reviewId && !rating && !review && !userId) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const updatedReview = await reviewHelper.updateReview(
      reviewId,
      rating,
      review,
      userId
    );

    console.log("Controller", updatedReview);

    if (!updatedReview) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_UPDATED_REVIEW,
      updatedReview
    );
  }),

  deleteReviewController: asyncHandler(async (res, req) => {
    const { reviewId } = req.body;
    const { userId } = req.auth;

    console.log("Controller", { reviewId, userId });

    if (!reviewId && !userId) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const deletedReview = await reviewHelper.deleteReview(reviewId, userId);

    if (!deletedReview) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_DELETED_REVIEW,
      deletedReview
    );
  }),
};
