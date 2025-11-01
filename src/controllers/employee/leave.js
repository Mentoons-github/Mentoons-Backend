const LeaveRequest = require("../../models/employee/leave");
const Employee = require("../../models/employee/employee");
const User = require("../../models/user");
const Notifications = require("../../models/adda/notification");
const asyncHandler = require("../../utils/asyncHandler");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelper");
const mongoose = require("mongoose");
const markLeaveInAttendance = require("../../helpers/employee/leave");
const recalculateMonthlySalary = require("../../helpers/employee/salary");

const requestLeave = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { leaveType, fromDate, toDate, reason, document, documents } = req.body;

  const employee = await Employee.findOne({ user: userId });
  if (!employee) return errorResponse(res, 404, "Employee not found");

  if (!leaveType || !fromDate || !toDate || !reason)
    return errorResponse(res, 400, "All fields are required");

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const rawDocs = [];
  if (document)
    rawDocs.push(...(Array.isArray(document) ? document : [document]));
  if (documents)
    rawDocs.push(...(Array.isArray(documents) ? documents : [documents]));

  const docArray = rawDocs.map((url) => ({
    name: url.split("/").pop()?.split("?")[0] ?? "document",
    url,
  }));

  const leave = await LeaveRequest.create({
    employeeId: employee._id,
    leaveType,
    fromDate,
    toDate,
    reason,
    attachments: docArray,
    totalDays,
    status: "pending",
  });

  const admins = await User.find({ role: "ADMIN" });
  const notifications = admins.map((admin) => ({
    userId: admin._id,
    initiatorId: userId,
    type: "alert",
    message: `${req.user.name} requested ${leaveType} leave (${fromDate} - ${toDate})`,
    referenceId: leave._id,
    referenceModel: "LeaveRequest",
  }));
  await Notifications.insertMany(notifications);

  return successResponse(res, 201, "Leave request submitted", leave);
});

const getEmployeeLeaves = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { month, year, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const employee = await Employee.findOne({ user: userId });
  if (!employee) return errorResponse(res, 404, "Employee not found");

  const dateFilter = { employeeId: employee._id };

  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    dateFilter.fromDate = { $gte: start, $lte: end };
  }

  const total = await LeaveRequest.countDocuments(dateFilter);

  const leaves = await LeaveRequest.find(dateFilter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return successResponse(res, 200, "Leaves fetched", {
    data: leaves,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const getAllLeaves = asyncHandler(async (req, res) => {
  const {
    status,
    department,
    month,
    year,
    page = 1,
    limit = 10,
    search,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const matchStage = {};
  if (status) matchStage.status = status;

  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    matchStage.fromDate = { $gte: start, $lte: end };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },
    {
      $lookup: {
        from: "users",
        localField: "employee.user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ];

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    pipeline.push({
      $match: {
        $or: [
          { "user.name": searchRegex },
          { "employee.department": searchRegex },
        ],
      },
    });
  }

  if (department) {
    pipeline.push({ $match: { "employee.department": department } });
  }

  pipeline.push({
    $project: {
      _id: 1,
      leaveType: 1,
      fromDate: 1,
      toDate: 1,
      reason: 1,
      status: 1,
      notes: 1,
      attachments: 1,
      totalDays: 1,
      createdAt: 1,
      "user.name": 1,
      "user.email": 1,
      "employee.department": 1,
    },
  });

  const totalPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await LeaveRequest.aggregate(totalPipeline);
  const total = totalResult[0]?.total || 0;

  pipeline.push({ $skip: skip }, { $limit: limitNum });

  const leaves = await LeaveRequest.aggregate(pipeline);

  return successResponse(res, 200, "All leave requests fetched", {
    data: leaves,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const approveLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;

  console.log("Approve Leave Request Started");
  console.log("Leave ID:", id);
  console.log("Admin ID:", adminId);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn("Invalid Leave ID format:", id);
    return errorResponse(res, 400, "Invalid leave ID");
  }

  console.log("Fetching leave request from DB...");
  const leave = await LeaveRequest.findById(id).populate("employeeId");

  if (!leave) {
    console.warn("Leave request not found for ID:", id);
    return errorResponse(res, 404, "Leave request not found");
  }

  console.log("Leave found:", {
    _id: leave._id,
    employee: leave.employeeId?.name || "N/A",
    status: leave.status,
    fromDate: leave.fromDate,
    toDate: leave.toDate,
  });

  if (leave.status !== "pending") {
    console.warn("Leave already processed. Current status:", leave.status);
    return errorResponse(res, 400, "Leave already processed");
  }

  console.log("Updating leave status to 'approved'...");
  leave.status = "approved";
  leave.reviewedAt = new Date();
  leave.reviewedBy = adminId;

  try {
    await leave.save();
    console.log("Leave status updated successfully in DB");
  } catch (saveError) {
    console.error("Failed to save leave after approval:", saveError);
    return errorResponse(res, 500, "Failed to update leave status");
  }

  const employeeId = leave.employeeId._id;
  const fromDate = leave.fromDate;
  const toDate = leave.toDate;

  console.log("Marking leave in attendance system...");
  console.log("Employee ID:", employeeId);
  console.log(
    "Date Range:",
    fromDate.toISOString(),
    "to",
    toDate.toISOString()
  );

  try {
    await markLeaveInAttendance(employeeId, fromDate, toDate);
    console.log("Leave marked in attendance successfully");
  } catch (attendanceError) {
    console.error("Failed to mark leave in attendance:", attendanceError);
  }

  console.log("Recalculating monthly salary for employee:", employeeId);
  try {
    await recalculateMonthlySalary(employeeId);
    console.log("Salary recalculated successfully");
  } catch (salaryError) {
    console.error("Failed to recalculate salary:", salaryError);
  }

  console.log("Creating notification for employee...");
  const notificationMessage = `Your leave from ${fromDate.toDateString()} to ${toDate.toDateString()} has been approved.`;

  try {
    await Notifications.create({
      userId: leave.employeeId.user,
      initiatorId: adminId,
      type: "info",
      message: notificationMessage,
      referenceId: leave._id,
      referenceModel: "LeaveRequest",
    });
    console.log("Notification created and saved");
  } catch (notifError) {
    console.error("Failed to create notification:", notifError);
  }

  console.log("Leave approval process completed successfully");
  return successResponse(res, 200, "Leave approved successfully", leave);
});

const rejectLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const adminId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id))
    return errorResponse(res, 400, "Invalid leave ID");

  const leave = await LeaveRequest.findById(id).populate("employeeId");
  if (!leave) return errorResponse(res, 404, "Leave request not found");

  if (leave.status !== "pending")
    return errorResponse(res, 400, "Leave already processed");

  leave.status = "rejected";
  leave.notes = notes || "No remarks provided";
  leave.reviewedBy = adminId;
  leave.reviewedAt = new Date();
  await leave.save();

  await Notifications.create({
    userId: leave.employeeId.user,
    initiatorId: adminId,
    type: "alert",
    message: `Your leave from ${leave.fromDate.toDateString()} to ${leave.toDate.toDateString()} was rejected. Remarks: ${
      leave.notes
    }`,
    referenceId: leave._id,
    referenceModel: "LeaveRequest",
  });

  return successResponse(res, 200, "Leave rejected", leave);
});

const cancelLeave = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return errorResponse(res, 400, "Invalid leave ID");

  const employee = await Employee.findOne({ user: userId });
  const leave = await LeaveRequest.findById(id);
  if (!leave) return errorResponse(res, 404, "Leave request not found");

  if (!employee || leave.employeeId.toString() !== employee._id.toString()) {
    return errorResponse(res, 403, "You can only cancel your own leave");
  }

  if (leave.status !== "pending") {
    return errorResponse(res, 400, "Only pending leaves can be cancelled");
  }

  leave.status = "cancelled";
  await leave.save();

  return successResponse(res, 200, "Leave cancelled successfully", leave);
});

const getLeaveStats = asyncHandler(async (req, res) => {
  console.log("reached leave stats");
  const userId = req.user._id;
  const employee = await Employee.findOne({ user: userId });
  if (!employee) return errorResponse(res, 404, "Employee not found");

  const stats = await LeaveRequest.aggregate([
    { $match: { employeeId: employee._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const formattedStats = {
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
  };

  stats.forEach((s) => {
    formattedStats[s._id] = s.count;
  });

  const total = stats.reduce((acc, s) => acc + s.count, 0);
  console.log(formattedStats);

  return successResponse(res, 200, "Leave statistics fetched successfully", {
    ...formattedStats,
    total,
  });
});

module.exports = {
  requestLeave,
  getEmployeeLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveStats,
};
