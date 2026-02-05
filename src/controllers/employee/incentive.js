const Incentive = require("../../models/employee/incentive");
const asyncHandler = require("../../utils/asyncHandler");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelper");

const getEmployeeIncentives = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = Math.max(parseInt(req.query.page || 1), 1);
  const limit = Math.min(parseInt(req.query.limit || 6), 10);
  const skip = (page - 1) * limit;

  const { search, sort } = req.query;
  let filter = { employee: userId };

  if (search) {
    const regex = new RegExp(search, "i");
    filter = {
      ...filter,
      $or: [
        { sourceType: regex },
        { _id: regex },
      ],
    };
  }

  let sortOption = {};
  switch (sort) {
    case "amount_asc":
      sortOption = { incentiveAmount: 1 };
      break;
    case "amount_desc":
      sortOption = { incentiveAmount: -1 };
      break;
    case "date_asc":
      sortOption = { createdAt: 1 };
      break;
    case "date_desc":
      sortOption = { createdAt: -1 };
      break;
    case "status_pending":
      sortOption = { status: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const [incentives, total] = await Promise.all([
    Incentive.find(filter).sort(sortOption).skip(skip).limit(limit),
    Incentive.countDocuments(filter),
  ]);

  const populatedIncentives = await Promise.all(
    incentives.map(async (inc) => {
      let sourceDetails = null;

      if (inc.sourceType === "WORKSHOP_BATCH") {
        sourceDetails = await Workshop.findById(inc.sourceId);
      } else if (inc.sourceType === "SESSION") {
        sourceDetails = await Session.findById(inc.sourceId);
      }

      return {
        ...inc.toObject(),
        sourceDetails,
      };
    }),
  );

  return successResponse(res, 200, "Employee incentives fetched", {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: populatedIncentives,
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
