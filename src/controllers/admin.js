const adminHelper = require("../helpers/adminHelper");
const Admin = require("../models/admin");
const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const User = require("../models/user");
const { clerk } = require("../middlewares/auth.middleware");
const Employee = require("../models/employee/employee");
const Task = require("../models/employee/task");

module.exports = {
  adminRegisterController: asyncHandler(async (req, res, next) => {
    const { name, email, password, phoneNumber } = req.body;

    if (
      !(
        name?.trim() &&
        email?.trim() &&
        password?.trim() &&
        phoneNumber?.trim()
      )
    ) {
      return errorResponse(
        res,
        400,
        "Name, Email, Password & PhoneNumber is a required field"
      );
    }

    const user = await adminHelper.registerUser(req.body);
    successResponse(res, 201, "User registered successfully!", user);
  }),

  adminLoginController: asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!(email?.trim() && password?.trim())) {
      return errorResponse(res, 400, "Email and password is a required field");
    }

    const user = await adminHelper.loginUser(req.body);

    const { accessToken, refreshToken } =
      await adminHelper.generateAccessAndRefreshToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    user.token = accessToken;
    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, options);
    successResponse(res, 200, "user logged in successfully", user);
  }),

  makeAdmin: asyncHandler(async (req, res, next) => {
    const user = req.user;
    const fetchedUser = await Admin.findById(user._id);
    if (!fetchedUser) {
      throw customError(500, "Something went wrong while fetching user data");
    }
    if (fetchedUser.role === "ADMIN") {
      throw customError(400, "User is already an admin");
    }

    fetchedUser.role = "ADMIN";
    await fetchedUser.save({ validateBeforeSave: false });

    return successResponse(res, 200, "User promoted to Admin");
  }),

  getUsersController: asyncHandler(async (req, res, next) => {
    const users = await adminHelper.getAllUsersFromDB();
    successResponse(res, 200, messageHelper.USER_FETCHED_SUCCESSFULLY, users);
  }),

  getOneUserController: asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await adminHelper.getOneUserFromDB(userId);
    if (!user) {
      return errorResponse(res, 200, messageHelper.USER_DOESNT_EXISTS);
    }
    successResponse(res, 200, messageHelper.USER_FETCHED_SUCCESSFULLY, user);
  }),

  blacklistUserController: asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await adminHelper.blacklistUser(userId);
    if (!user) {
      return errorResponse(res, 404, messageHelper.USER_DOESNT_EXISTS);
    }
    successResponse(res, 200, messageHelper.USER_BLACKLIST);
  }),

  viewSessionCalls: asyncHandler(async (req, res) => {
    const { search, sortField, sortOrder, page, limit } = req.query;
    console.log("checking the query");
    const sessionCalls = await adminHelper.getAllSessionCalls(
      search,
      sortField,
      sortOrder,
      page,
      limit
    );

    console.log("session detail :", sessionCalls);

    if (!sessionCalls) {
      return errorResponse(res, 400, messageHelper.BAD_REQUEST);
    }
    return successResponse(
      res,
      200,
      "Successfully fetched session calls",
      sessionCalls
    );
  }),

  fetchAdmin: asyncHandler(async (req, res) => {
    const adminId = req.user._id;

    const adminData = await User.findOne({ _id: adminId, role: "ADMIN" });
    if (!adminData) {
      return res.status(404).json({ message: "No admin found" });
    }

    const admin = {
      _id: adminData._id,
      clerkId: adminData.clerkId,
      role: adminData.role,
      name: adminData.name,
      email: adminData.email,
      phoneNumber: adminData.phoneNumber,
      picture: adminData.picture,
      joinDate: adminData.joinedDate,
    };

    return res.status(200).json(admin);
  }),

  editAdmin: asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { data } = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const allowedFields = ["name", "email", "phoneNumber", "picture"];
    const updateFields = {};

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateFields[key] = data[key];
      }
    }

    const updatedAdmin = await User.findOneAndUpdate(
      { _id: adminId, role: "ADMIN" },
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      message: "Admin updated successfully",
      admin: {
        _id: updatedAdmin._id,
        clerkId: updatedAdmin.clerkId,
        role: updatedAdmin.role,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        phoneNumber: updatedAdmin.phoneNumber,
        picture: updatedAdmin.picture,
        joinDate: updatedAdmin.createdAt,
      },
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const { clerkId } = req.user;

    if (!newPassword || newPassword.trim() === "") {
      console.log("No password provided");
      return res.status(400).json({ message: "No password found" });
    }

    try {
      await clerk.users.updateUser(clerkId, { password: newPassword });

      return res
        .status(200)
        .json({ message: "Password updated successfully." });
    } catch (err) {
      console.error("Error updating password in Clerk:", err);
      return res.status(500).json({ message: "Failed to update password." });
    }
  }),

  getEmployeeTaskStats: asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allTasks = await Task.find({ assignedTo: employeeId });

    const stats = {
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter((t) => t.status === "completed").length,
      pendingTasks: allTasks.filter((t) => t.status === "pending").length,
      inProgressTasks: allTasks.filter((t) => t.status === "in-progress")
        .length,
      overdueTasks: allTasks.filter((t) => t.status === "overdue").length,
    };

    const tasks = await Task.find({ assignedTo: employeeId })
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        stats,
        tasks,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(allTasks.length / limit),
          totalTasks: allTasks.length,
        },
      },
    });
  }),
};
