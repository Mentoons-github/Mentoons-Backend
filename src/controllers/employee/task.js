const User = require("../../models/user");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");
const asyncHandler = require("../../utils/asyncHandler");
const Task = require("../../models/employee/task");

const assignTask = asyncHandler(async (req, res) => {
  const data = req.body;

  const task = await Task.create(data);
  if (!task) {
    return errorResponse(res, 404, "Failed to save task");
  }

  return successResponse(res, 200, "Task assigned successfully");
});

module.exports = {
  assignTask,
};
