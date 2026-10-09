const AssessmentHistory = require("../models/assessmentHistory.js");
const asyncHandler = require("../utils/asyncHandler.js");

const recordAssessmentAttempt = asyncHandler(async (req, res) => {
  const userId = req.user?.dbUser?._id || req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const {
    productId,
    assessmentTitle,
    ageCategory,
    score,
    totalQuestions,
    status,
  } = req.body;

  if (!productId || !assessmentTitle) {
    return res.status(400).json({
      success: false,
      message: "productId and assessmentTitle are required",
    });
  }

  const record = await AssessmentHistory.create({
    user: userId,
    product: productId,
    assessmentTitle,
    ageCategory,
    score,
    totalQuestions,
    status: status || "completed",
    completedAt: new Date(),
  });

  return res.status(201).json({ success: true, data: record });
});

const getAssessmentHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.dbUser?._id || req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { limit = "10", page = "1" } = req.query;
  const limitNumber = parseInt(limit, 10);
  const pageNumber = parseInt(page, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const [history, total] = await Promise.all([
    AssessmentHistory.find({ user: userId })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("product", "title productImages"),
    AssessmentHistory.countDocuments({ user: userId }),
  ]);

  return res.status(200).json({
    success: true,
    data: history,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
  });
});

module.exports = {
  recordAssessmentAttempt,
  getAssessmentHistory,
};
