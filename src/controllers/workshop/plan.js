const asyncHandler = require("../../utils/asyncHandler");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");
const Plans = require("../../models/workshop/plan");

const getAllPlans = asyncHandler(async (req, res) => {
  const plans = await Plans.find();
  if (plans.length === 0) {
    return errorResponse(res, 404, "No Plans found");
  }

  return successResponse(res, 200, "Data retrieved successfully", plans);
});

const addEditPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  let plan;

  if (id) {
    plan = await Plans.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!plan) {
      return errorResponse(res, 404, "No Plan found");
    }
    return successResponse(res, 200, "Plan edited successfully");
  }

  const existing = await Plans.findOne({ planId: data.planId });
  if (existing) {
    return errorResponse(res, 409, "Plan already exists");
  }

  plan = await Plans.create(data);
  return successResponse(res, 201, "Plan created successfully");
});

const deletePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const plan = await Plans.findByIdAndDelete(id);

  if (!plan) {
    return errorResponse(res, 404, "Plan not found");
  }

  return successResponse(res, 200, "Plan deleted successfully");
});

const fetchPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const plan = await Plans.findById(id);

  if (!plan) {
    return errorResponse(res, 404, "No plan found");
  }

  return successResponse(res, 200, plan);
});

module.exports = {
  getAllPlans,
  addEditPlan,
  deletePlan,
  fetchPlanById,
};
