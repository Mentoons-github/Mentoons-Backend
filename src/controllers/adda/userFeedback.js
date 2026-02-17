const UserFeedBack = require("../../models/adda/userFeedback");
const asyncHandler = require("../../utils/asyncHandler");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const feedbackSubmit = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { feedback: feedbackData, rating } = req.body.formValues;

  const userFeedback = await UserFeedBack.findOne({ user: userId });

  if (userFeedback) {
    return errorResponse(res, 401, "You have already submitted feedback");
  }

  const feedback = await UserFeedBack.create({
    user: userId,
    feedback: feedbackData,
    rating,
  });

  if (!feedback) {
    return errorResponse(res, 400, "Error saving feedback");
  }

  return successResponse(res, 200, "Feedback submitted successfully");
});

const fetchFeedback = asyncHandler(async (req, res) => {
  const { limit = "10", page = "1" } = req.query;

  const limitNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);
  const skip = (pageNum - 1) * limitNum;

  const feedback = await UserFeedBack.find({})
    .populate("user", "name picture email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  if (!feedback.length) {
    return errorResponse(res, 404, "No feedback found");
  }

  const totalCount = await UserFeedBack.countDocuments();

  return successResponse(res, 200, "Feedbacks fetched successfully", {
    feedback,
    totalCount,
    page: pageNum,
    limit: limitNum,
  });
});

const saveDisplayReviews = asyncHandler(async (req, res) => {
  const reviewIds = req.body.reviewIds;
  console.log(reviewIds);
  const feedback = await UserFeedBack.find({ _id: { $in: reviewIds } });

  if (feedback.length === 0) {
    return errorResponse(res, 400, "No feedbacks found");
  }

  const foundIds = feedback.map((id) => id._id.toString());
  const missedIds = reviewIds.filter((id) => !foundIds.includes(id));
  if (missedIds.length > 0) {
    return errorResponse(
      res,
      400,
      "Some IDs are not in the DB: " + missedIds.join(", "),
    );
  }

  await UserFeedBack.updateMany(
    {
      _id: { $in: reviewIds },
    },
    { $set: { showToUser: true } },
  );

  return successResponse(res, 200, "Feedbacks are now visible to the user");
});

module.exports = {
  feedbackSubmit,
  fetchFeedback,
  saveDisplayReviews,
};
