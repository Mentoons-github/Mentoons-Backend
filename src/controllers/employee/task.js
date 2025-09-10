const User = require("../../models/user");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");
const asyncHandler = require("../../utils/asyncHandler");
const Task = require("../../models/employee/task");

const fetchTasks = asyncHandler(async (req, res) => {
  const employeeId = req.employee._id;

  const tasks = await Task.find({ assignedTo: employeeId })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});
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
  fetchTasks,
};
