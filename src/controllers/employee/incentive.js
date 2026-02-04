const Incentive = require("../../models/employee/incentive");
const asyncHandler = require("../../utils/asyncHandler");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelper");

const getEmployeeIncentives = asyncHandler(async (req, res) => {
  const userId = req.user.dbUser._id;
  const page = Math.max(parseInt(req.query.page || 1), 1);
  const limit = Math.min(parseInt(req.query.limit || 6), 10);

  const skip = (page - 1) * limit;

  const [incentive, total] = await Promise.all([
    Incentive.find({ employee: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Incentive.countDocuments({ employee: userId }),
  ]);

  return successResponse(res, 200, "Employee incentives fetched", {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: incentive,
  });
});

const getIncentiveById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const incentive = await Incentive.findById(id).populate("employee");
  if (!incentive) {
    return errorResponse(res, 404, "No incentive found");
  }
  return successResponse(res, 200, "Incentive fetched successfully", incentive);
});

const updateIncentiveStatus = asyncHandler(async (req, res) => {
  const { id, status } = req.body;
  const incentive = await Incentive.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );
  if (!incentive) {
    return errorResponse(res, 404, "No incentive found");
  }
  return successResponse(res, 200, "Incentive fetched successfully", incentive);
});

module.exports = {
  getEmployeeIncentives,
  getIncentiveById,
  updateIncentiveStatus,
};
