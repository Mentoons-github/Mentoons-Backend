const adminHelper = require("../helpers/adminHelper");
const Admin = require("../models/admin");
const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

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
};
