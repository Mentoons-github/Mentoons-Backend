const asyncHandler = require("../../utils/asyncHandler");
const bplVerificationService = require("../../services/workshop/bplVerification.service");
const { successResponse } = require("../../utils/responseHelper");

const bplVerificationFormsubmit = asyncHandler(async (req, res) => {
  const userId = req.user;
  const details = req.body;
  const result = await bplVerificationService.bplVerificationFormsubmit(
    userId,
    details,
  );

  return successResponse(res, 200, result);
});

//check applied or not
const checkApplied = asyncHandler(async (req, res) => {
  const userId = req.user;
  const result = await bplVerificationService.checkApplied(userId);
  return successResponse(res, 200, "Checked applied or not", result);
});

//fetch all application
const getAllBplApplication = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    search,
    sortField,
    sortOrder,
    page = 1,
    limit = 10,
    filter,
  } = req.query;
  const queryOptions = {
    search,
    sortField,
    sortOrder,
    page: parseInt(page),
    limit: parseInt(limit),
    filter: filter ? { status: filter } : {},
  };

  const result = await bplVerificationService.getAllBplApplication(
    userId,
    queryOptions,
  );
  return successResponse(res, 200, "All Bpl Application fetched", result);
});

//update application status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = req.body;
  const result = await bplVerificationService.updateApplicationStatus(
    userId,
    data,
  );
  return successResponse(
    res,
    201,
    `Application status updated to ${data.statuss}`,
    result,
  );
});

//delete application
const deleteBplApplication = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { applicationId } = req.params;
  const result = await bplVerificationService.deleteBplApplication(
    userId,
    applicationId,
  );
  return successResponse(res, 200, "Bpl verification application deleted");
});

module.exports = {
  bplVerificationFormsubmit,
  checkApplied,
  getAllBplApplication,
  updateApplicationStatus,
  deleteBplApplication,
};
