const messageHelper = require("../utils/messageHelper");

const Employee = require("../models/employee");
const asyncHandler = require("../utils/asyncHandler");
const { errorResponse, successResponse } = require("../utils/responseHelper");

const getEmployeeData = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;

  console.log("reached get employee controller");

  const skip = (page - 1) * Number(limit);
  const searchRegex = new RegExp(search, "i");

  const employees = await Employee.aggregate([
    {
      $match: {
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { department: { $regex: searchRegex } },
          { role: { $regex: searchRegex } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$salary" },
                regex: searchRegex,
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$phone" },
                regex: searchRegex,
              },
            },
          },
          { "place.houseName": { $regex: searchRegex } },
          { "place.street": { $regex: searchRegex } },
          { "place.city": { $regex: searchRegex } },
          { "place.district": { $regex: searchRegex } },
          { "place.state": { $regex: searchRegex } },
          { "place.pincode": { $regex: searchRegex } },
          { "place.country": { $regex: searchRegex } },
        ],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        role: 1,
        department: 1,
        phone: 1,
        salary: 1,
        isActive: 1,
        joinDate: 1,
        place: 1,
        profilePicture: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  const totalEmployees = await Employee.countDocuments({
    $or: [
      { name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
      { department: { $regex: searchRegex } },
      { role: { $regex: searchRegex } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$salary" },
            regex: searchRegex,
          },
        },
      },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$phone" },
            regex: searchRegex,
          },
        },
      },
      { "place.houseName": { $regex: searchRegex } },
      { "place.street": { $regex: searchRegex } },
      { "place.city": { $regex: searchRegex } },
      { "place.district": { $regex: searchRegex } },
      { "place.state": { $regex: searchRegex } },
      { "place.pincode": { $regex: searchRegex } },
      { "place.country": { $regex: searchRegex } },
    ],
  });

  const totalPages = Math.ceil(totalEmployees / limit);
  const currentPage = page;

  if (!employees || employees.length === 0) {
    return errorResponse(res, 404, messageHelper.EMPLOYEE_NOT_FOUND);
  }

  return successResponse(res, 200, messageHelper.EMPLOYEE_FETCHED, {
    employees,
    currentPage,
    totalPages,
    totalEmployees,
  });
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employees = await Employee.findById({ _id: id });

  if (!employees) {
    return errorResponse(res, 404, messageHelper.EMPLOYEE_NOT_FOUND);
  }

  return successResponse(res, 200, messageHelper.EMPLOYEE_FETCHED, employees);
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const employee = await Employee.findById(id);
  if (!employee) {
    return errorResponse(res, 404, messageHelper.EMPLOYEE_NOT_FOUND);
  }

  await Employee.findByIdAndDelete(id);

  return successResponse(res, 200, messageHelper.EMPLOYEE_DELETED, employee);
});

const createEmployee = asyncHandler(async (req, res) => {
  const employeeData = req.body;

  if (
    !employeeData.name ||
    !employeeData.email ||
    !employeeData.phone ||
    !employeeData.role ||
    !employeeData.department ||
    !employeeData.salary ||
    !employeeData.place
  ) {
    return errorResponse(res, 400, messageHelper.BAD_REQUEST);
  }

  const employeeExist = await Employee.find({
    $or: [{ email: employeeData.email }, { phone: employeeData.phone }],
  });

  if (employeeExist) {
    return errorResponse(res, 400, "email or phone number already exists");
  }

  const { houseName, street, city, district, state, pincode, country } =
    employeeData.place;

  if (
    !houseName ||
    !street ||
    !city ||
    !district ||
    !state ||
    !pincode ||
    !country
  ) {
    return errorResponse(res, 400, "All address fields are required");
  }

  const employee = await Employee.create(employeeData);

  return successResponse(res, 201, messageHelper.EMPLOYEE_CREATED, employee);
});

const editEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!updateData || Object.keys(updateData).length === 0) {
    return errorResponse(res, 400, "No data provided for update");
  }

  const employee = await Employee.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!employee) {
    return errorResponse(res, 404, messageHelper.EMPLOYEE_NOT_FOUND);
  }

  return successResponse(res, 200, messageHelper.EMPLOYEE_UPDATED, employee);
});

module.exports = {
  getEmployeeData,
  getById,
  deleteEmployee,
  createEmployee,
  editEmployee,
};
