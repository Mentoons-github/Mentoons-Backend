const Employee = require("../../models/employee/employee");
const User = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");
const messageHelper = require("../../utils/messageHelper");
const Task = require("../../models/employee/task");
const Notifications = require("../../models/adda/notification");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelper");
const { default: mongoose } = require("mongoose");

const createEmployee = asyncHandler(async (req, res) => {
  const employeeData = req.body;
  console.log("Received employee data:", employeeData);

  let user = await User.findOne({ email: employeeData.email });
  console.log("Existing user found:", user);

  if (!user) {
    console.log("No user found, creating new user...");
    user = await User.create({
      name: employeeData.name,
      email: employeeData.email,
      role: "EMPLOYEE",
      activeSession: new Date(),
    });
    console.log("New user created:", user);
  } else {
    console.log("User exists, updating role to EMPLOYEE");
    user.role = "EMPLOYEE";
    await user.save();
    console.log("User after role update:", user);
  }

  const employeeDetail = await Employee.create({
    user: user._id,
    department: employeeData.department,
    joinDate: employeeData.joinDate,
    salary: employeeData.salary,
    isActive: employeeData.isActive,
    place: employeeData.place,
    profilePicture: employeeData.profilePicture,
    phone: employeeData.phone || "",
  });
  console.log("Employee detail created:", employeeDetail);

  const employee = {
    _id: employeeDetail._id,
    name: user.name,
    email: user.email,
    phone: employeeDetail.phone,
    role: user.role,
    department: employeeDetail.department,
    joinDate: employeeDetail.joinDate,
    isActive: employeeDetail.isActive,
    salary: employeeDetail.salary,
    place: employeeDetail.place,
    profilePicture: employeeDetail.profilePicture,
    createdAt: employeeDetail.createdAt,
    updatedAt: employeeDetail.updatedAt,
  };
  console.log("Final employee object to return:", employee);

  return successResponse(res, 201, messageHelper.EMPLOYEE_CREATED, employee);
});

const getEmployees = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  console.log("Query params received:", { page, limit, search });

  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(search, "i");
  console.log("Pagination values:", { skip, limit });
  console.log("Search regex:", searchRegex);

  let pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
  ];
  let result = await Employee.aggregate(pipeline);
  console.log("After $lookup:", result);

  // 2️⃣ $unwind
  pipeline.push({ $unwind: "$userInfo" });
  result = await Employee.aggregate(pipeline);
  console.log("After $unwind:", result);

  // 3️⃣ $match
  pipeline.push({
    $match: {
      $or: [
        { "userInfo.name": { $regex: searchRegex } },
        { "userInfo.email": { $regex: searchRegex } },
        { department: { $regex: searchRegex } },
        { "userInfo.role": { $regex: searchRegex } },
        { "userInfo.phoneNumber": { $regex: searchRegex } },
        { "place.city": { $regex: searchRegex } },
        { "place.state": { $regex: searchRegex } },
        { "place.country": { $regex: searchRegex } },
      ],
    },
  });
  result = await Employee.aggregate(pipeline);
  console.log("After $match:", result);

  // 4️⃣ $project
  pipeline.push({
    $project: {
      _id: 1,
      department: 1,
      salary: 1,
      isActive: 1,
      joinDate: 1,
      place: 1,
      profilePicture: 1,
      profileEditRequest: 1,
      "userInfo.name": 1,
      "userInfo.email": 1,
      "userInfo.role": 1,
      "userInfo.phoneNumber": 1,
    },
  });
  result = await Employee.aggregate(pipeline);
  console.log("After $project:", result);

  // 5️⃣ $sort
  pipeline.push({ $sort: { createdAt: -1 } });
  result = await Employee.aggregate(pipeline);
  console.log("After $sort:", result);

  // 6️⃣ $skip
  pipeline.push({ $skip: skip });
  result = await Employee.aggregate(pipeline);
  console.log("After $skip:", result);

  // 7️⃣ $limit
  pipeline.push({ $limit: limit });
  const employees = await Employee.aggregate(pipeline);
  console.log("After $limit (final result):", employees);

  if (!employees || employees.length === 0) {
    console.log("No employees found matching criteria");
    return errorResponse(res, 404, messageHelper.EMPLOYEE_NOT_FOUND);
  }

  const formattedEmployees = employees.map((emp) => {
    const formatted = {
      _id: emp._id,
      name: emp.userInfo.name,
      email: emp.userInfo.email,
      phone: emp.userInfo.phoneNumber,
      role: emp.userInfo.role,
      department: emp.department,
      joinDate: emp.joinDate,
      isActive: emp.isActive,
      salary: emp.salary,
      place: emp.place,
      profilePicture: emp.profilePicture,
    };

    if (
      emp.profileEditRequest &&
      Object.keys(emp.profileEditRequest).length > 0
    ) {
      formatted.profileEditRequest = emp.profileEditRequest;
    }

    return formatted;
  });

  console.log("Formatted employees to return:", formattedEmployees);

  return successResponse(res, 200, messageHelper.EMPLOYEE_FETCHED, {
    employees: formattedEmployees,
    currentPage: page,
    totalPages: Math.ceil(employees.length / limit),
    totalEmployees: employees.length,
  });
});

const getEmployeeById = async (req, res) => {
  try {
    console.log(req.params);
    const { id } = req.params;
    console.log(id);

    const employee = await Employee.findById(id).populate(
      "user",
      "name email role"
    );

    console.log(employee);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (employee.user?.role !== "EMPLOYEE") {
      return res.status(401).json({
        success: false,
        message: "User is not an employee",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: employee._id,
        name: employee.user.name,
        email: employee.user.email,
        role: employee.user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEmployeeProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const employeeDoc = await Employee.findOne({ user: user._id }).populate(
      "user",
      "-password -__v -createdAt -updatedAt"
    );
    if (!employeeDoc) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log("employeeDoc :", employeeDoc);

    const employee = {
      department: employeeDoc.department,
      salary: employeeDoc.salary,
      active: employeeDoc.active,
      jobRole: employeeDoc.jobRole,
      user: {
        name: employeeDoc.user?.name || "",
        email: employeeDoc.user?.email || "",
        role: employeeDoc.user?.role || "employee",
        picture: employeeDoc.user?.picture || "",
        gender: employeeDoc.user?.gender || "other",
        phoneNumber: employeeDoc.user?.phoneNumber || null,
      },
    };

    if (employeeDoc.profileEditRequest) {
      console.log("profilerequest found");
      employee.profileEditRequest = employeeDoc.profileEditRequest;
    }

    console.log("employeefetched :", employee);
    const tasks = await Task.find({ assignedTo: employeeDoc._id });

    const stats = {
      assigned: tasks.length,
      submitted: tasks.filter((t) => t.status === "completed").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
    };

    const recentTasks = tasks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        dueDate: t.deadline.toDateString(),
      }));

    return res.status(200).json({
      employee,
      tasks: stats,
      recentTasks,
    });
  } catch (err) {
    console.error("Error fetching employee profile:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editEmployee = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { user: userData } = req.body;

    let updatedUser = null;
    if (userData) {
      const { name, gender, picture } = userData;

      if (
        name !== undefined &&
        (typeof name !== "string" || name.trim() === "")
      ) {
        return res
          .status(400)
          .json({ message: "Name is required and must be a non-empty string" });
      }
      if (
        gender !== undefined &&
        (typeof gender !== "string" ||
          !["male", "female", "other"].includes(gender))
      ) {
        return res
          .status(400)
          .json({ message: "Gender must be 'male', 'female', or 'other'" });
      }
      if (
        picture !== undefined &&
        (typeof picture !== "string" || picture.trim() === "")
      ) {
        return res
          .status(400)
          .json({ message: "Picture must be a non-empty string or undefined" });
      }

      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(name !== undefined && { name }),
            ...(gender !== undefined && { gender }),
            ...(picture !== undefined && { picture }),
          },
        },
        { new: true, runValidators: true }
      ).select("name email role picture gender phoneNumber");
    }

    const updatedEmployee = await Employee.findOne({ user: userId }).populate(
      "user",
      "name email role picture gender phoneNumber"
    );

    if (!updatedEmployee) {
      return res
        .status(404)
        .json({ message: "Employee not found during update" });
    }

    const response = {
      department: updatedEmployee.department,
      salary: updatedEmployee.salary,
      active: updatedEmployee.active,
      user: {
        name: updatedEmployee.user.name || "",
        email: updatedEmployee.user.email || "",
        role: updatedEmployee.user.role || "",
        picture: updatedEmployee.user.picture || undefined,
        gender: updatedEmployee.user.gender || "other",
        phoneNumber: updatedEmployee.user.phoneNumber || null,
      },
      jobRole: updatedEmployee.jobRole,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Error updating employee:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const requestProfileEdit = async (req, res) => {
  try {
    const employeeId = req.user._id;
    console.log(employeeId);

    const employee = await Employee.findOne({ user: employeeId }).populate(
      "user",
      "_id name"
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.profileEditRequest?.status === "pending") {
      return res
        .status(400)
        .json({ message: "You already have a pending request" });
    }

    employee.profileEditRequest = {
      status: "pending",
      requestedAt: new Date(),
    };

    await employee.save();

    const admins = await User.find({ role: "ADMIN" });

    const notifications = admins.map((admin) => ({
      userId: admin._id,
      initiatorId: employee.user,
      type: "alert",
      message: `${employee.user.name} requested a profile edit`,
      referenceId: employeeId,
      referenceModel: "Employee",
    }));

    await Notifications.insertMany(notifications);

    res
      .status(200)
      .json({ message: "Profile edit request submitted", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeProfile,
  editEmployee,
  requestProfileEdit,
};
