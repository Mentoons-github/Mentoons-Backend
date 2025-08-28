const Employee = require("../../models/employee/employee");
const User = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");
const messageHelper = require("../../utils/messageHelper");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelper");

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

  // 1️⃣ $lookup
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

  const formattedEmployees = employees.map((emp) => ({
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
  }));

  console.log("Formatted employees to return:", formattedEmployees);

  return successResponse(res, 200, messageHelper.EMPLOYEE_FETCHED, {
    employees: formattedEmployees,
    currentPage: page,
    totalPages: Math.ceil(employees.length / limit),
    totalEmployees: employees.length,
  });
});

module.exports = {
  createEmployee,
  getEmployees,
};
