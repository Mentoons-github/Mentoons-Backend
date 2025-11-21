const asyncHandler = require("../../utils/asyncHandler");
const ContestModel = require("../../models/adda/contest");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const submitContestForm = asyncHandler(async (req, res) => {
  try {
    const { name, age, mobile, fileUrl, category } = req.body;

    if (!name || !age || !mobile || !fileUrl?.length || !category) {
      return errorResponse(
        res,
        400,
        "All fields are required including category"
      );
    }

    const savedSubmission = await ContestModel.create({
      name,
      age,
      mobile,
      images: fileUrl,
      category,
    });

    return successResponse(
      res,
      201,
      "Contest submission saved successfully",
      savedSubmission
    );
  } catch (err) {
    console.error("Contest submission error:", err);
    return errorResponse(res, 500, "Submission failed");
  }
});

module.exports = {
  submitContestForm,
};
