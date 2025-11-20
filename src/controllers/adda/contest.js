const asyncHandler = require("../../utils/asyncHandler");
const ContestModel = require("../../models/adda/contest");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const submitContestForm = asyncHandler(async (req, res) => {
  try {
    const { name, age, mobile, fileUrl } = req.body;

    if (!name || !age || !mobile || !fileUrl?.length) {
      return errorResponse(res, 400, "All fields are required");
    }

    const savedSubmission = await ContestModel.create({
      name,
      age,
      mobile,
      images: fileUrl,
    });

    return successResponse(
      res,
      200,
      "Contest submission saved",
      savedSubmission
    );
  } catch (err) {
    return errorResponse(res, 500, "Submission failed");
  }
});

module.exports = {
  submitContestForm,
};
