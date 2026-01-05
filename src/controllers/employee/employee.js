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

  let user = await User.findOne({ email: employeeData.email });

  if (!user) {
    console.log("No user found, creating new user...");
    user = await User.create({
      name: employeeData.name,
      email: employeeData.email,
      role: "EMPLOYEE",
      activeSession: new Date(),
    });
  } else {
    user.role = "EMPLOYEE";
    await user.save();
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

  return successResponse(res, 201, messageHelper.EMPLOYEE_CREATED, employee);
});

const getEmployees = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(search, "i");

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

  pipeline.push({ $unwind: "$userInfo" });
  result = await Employee.aggregate(pipeline);

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
      active: 1,
      "userInfo.name": 1,
      "userInfo.email": 1,
      "userInfo.role": 1,
      "userInfo.phoneNumber": 1,
      "userInfo.dateOfBirth": 1,
    },
  });
  result = await Employee.aggregate(pipeline);

  pipeline.push({ $sort: { createdAt: -1 } });
  result = await Employee.aggregate(pipeline);

  pipeline.push({ $skip: skip });
  result = await Employee.aggregate(pipeline);

  pipeline.push({ $limit: limit });
  const employees = await Employee.aggregate(pipeline);

  if (!employees || employees.length === 0) {
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
      salary: emp.salary,
      place: emp.place,
      profilePicture: emp.profilePicture,
      dateOfBirth: emp.userInfo.dateOfBirth || null,
      status: emp.active ? "Active" : "Inactive",
    };

    if (
      emp.profileEditRequest &&
      Object.keys(emp.profileEditRequest).length > 0
    ) {
      formatted.profileEditRequest = emp.profileEditRequest;
    }

    return formatted;
  });

  return successResponse(res, 200, messageHelper.EMPLOYEE_FETCHED, {
    employees: formattedEmployees,
    currentPage: page,
    totalPages: Math.ceil(employees.length / limit),
    totalEmployees: employees.length,
  });
});

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id).populate(
      "user",
      "name email role phoneNumber picture"
    );

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

    const fullDetails = {
      ...employee.toObject(),
      phoneNumber: employee.user.phoneNumber,
    };

    res.status(200).json({
      success: true,
      data: {
        id: employee._id,
        name: employee.user.name,
        email: employee.user.email,
        role: employee.user.role,
        fullDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//employee login
const employeeLogin = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { jobRole, jobType } = req.body;
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    return errorResponse(res, 400, "Invalid employee ID format");
  }
  const employee = await Employee.findById(employeeId).populate(
    "user",
    "name email role phoneNumber picture"
  );

  if (!employee) {
    return errorResponse(res, 404, "Employee not found");
  }
  if (employee.department !== jobRole) {
    return errorResponse(res, 404, `Your job role is not ${jobRole}`);
  }
  if (employee.employmentType !== jobType) {
    return errorResponse(res, 404, `You are not ${jobType} ${jobRole}`);
  }

  return successResponse(res, 200, "Employee login successfull", {
    id: employee._id,
    name: employee.user.name,
    email: employee.user.email,
    role: employee.user.role,
  });
});

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
        dob: employeeDoc.user?.dateOfBirth || null,
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
      const { name, gender, picture, dob } = userData;
      console.log(dob);

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
            ...(dob !== undefined && { dateOfBirth: dob }),
          },
        },
        { new: true, runValidators: true }
      ).select("name email role picture gender phoneNumber dateOfBirth");
    }

    const updatedEmployee = await Employee.findOneAndUpdate(
      { user: userId },
      { $set: { profileEditRequest: null } },
      { new: true }
    ).populate(
      "user",
      "name email role picture gender phoneNumber dateOfBirth"
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
      dob: updatedEmployee.user.dateOfBirth,
    };

    console.log(response);

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

const getEmployeesCelebrations = async (req, res) => {
  try {
    const employees = await Employee.find().populate(
      "user",
      "name email role picture gender phoneNumber dateOfBirth"
    );

    if (!employees.length) {
      return res.status(404).json({ message: "No employees found" });
    }

    const currentYear = new Date().getFullYear();
    const today = new Date();
    const celebrations = [];

    employees.forEach((emp) => {
      const { joinDate } = emp;
      const { name, picture, gender, phoneNumber, dateOfBirth } =
        emp.user || {};

      if (dateOfBirth) {
        const dob = new Date(dateOfBirth);
        const birthdayThisYear = new Date(
          currentYear,
          dob.getMonth(),
          dob.getDate()
        );

        if (birthdayThisYear.getFullYear() === currentYear) {
          celebrations.push({
            name,
            picture,
            gender,
            phoneNumber,
            type: "Birthday",
            date: birthdayThisYear,
          });
        }
      }

      if (joinDate) {
        const doj = new Date(joinDate);
        const milestones = [
          { months: 3, label: "3-Month Anniversary" },
          { months: 6, label: "6-Month Anniversary" },
          { months: 12, label: "1-Year Anniversary" },
          { months: 24, label: "2-Year Anniversary" },
          { months: 36, label: "3-Year Anniversary" },
          { months: 48, label: "4-Year Anniversary" },
          { months: 60, label: "5-Year Anniversary" },
        ];

        milestones.forEach((m) => {
          const anniversaryDate = new Date(doj);
          anniversaryDate.setMonth(doj.getMonth() + m.months);

          if (
            anniversaryDate.getFullYear() === currentYear &&
            anniversaryDate <= today
          ) {
            celebrations.push({
              name,
              picture,
              gender,
              phoneNumber,
              type: m.label,
              date: anniversaryDate,
            });
          }
        });
      }
    });

    console.log(celebrations);

    celebrations.sort((a, b) => a.date - b.date);

    res.status(200).json(celebrations);
  } catch (err) {
    console.error("Error fetching celebrations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const employee = await Employee.findOne({ user: userId }).populate(
      "user",
      "name email profilePicture"
    );

    if (!employee) {
      return res.status(404).json({ message: "No employee found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getMe,
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeProfile,
  editEmployee,
  requestProfileEdit,
  getEmployeesCelebrations,
  employeeLogin,
};
