const dotenv = require("dotenv");
dotenv.config();
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");
const userHelper = require("../helpers/userHelper");
const Auth = require("../utils/auth");
const { getUsersController } = require("./admin");

module.exports = {
  registerController: asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    // Validate required fields
    if (!phoneNumber) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.register(req.body);
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY, {
      result,
    });
  }),

  loginController: asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.login({ phoneNumber });
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }
    console.log("Login result", result);
    successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY, result);
  }),

  verifyUserRegistrationController: asyncHandler(async (req, res) => {
    const { otp, phoneNumber } = req.body;
    console.log(otp, "popooppo");
    if (!otp) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.verifyUserRegistration(otp, phoneNumber);
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    const accessToken = Auth.createAccessToken(
      { phoneNumber },
      process.env.ACCESS_TOKEN_SECRET
    );
    const refreshToken = Auth.createRefreshToken(
      { phoneNumber },
      process.env.REFRESH_TOKEN_SECRET
    );

    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_REGISTERED_USER,
      { result, accessToken, refreshToken }
    );
  }),

  verifyUserLoginController: asyncHandler(async (req, res) => {
    const { otp, phoneNumber } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!otp) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.verifyUserLogin(phoneNumber, otp, token);
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    const accessToken = Auth.createAccessToken(
      { phoneNumber },
      process.env.ACCESS_TOKEN_SECRET
    );
    const refreshToken = Auth.createRefreshToken(
      { phoneNumber },
      process.env.REFRESH_TOKEN_SECRET
    );

    return successResponse(res, 200, messageHelper.SUCCESSFULLY_LOGGED_USER, {
      result,
      accessToken,
      refreshToken,
    });
  }),

  logoutController: asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    if (!token) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.logout(token, phoneNumber);
    console.log(result);
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }
    return successResponse(
      res,
      200,
      messageHelper.SUCCESSFULLY_LOGOUT_USER,
      result
    );
  }),

  refreshTokenController: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    try {
      const decoded = Auth.verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const accessToken = Auth.createAccessToken(
        { phoneNumber: decoded.phoneNumber },
        process.env.ACCESS_TOKEN_SECRET
      );
      return successResponse(res, 200, messageHelper.TOKEN_REFRESHED, {
        accessToken,
      });
    } catch (error) {
      return errorResponse(res, 401, messageHelper.INVALID_REFRESH_TOKEN);
    }
  }),

  premiumController: asyncHandler(async (req, res) => {
    const { name, email, phoneNumber, city } = req.body;

    if (!(name && email && phoneNumber && city)) {
      return errorResponse(res, 400, "Missing Required Fields");
    }

    const existingUser = await User.findOne({ phoneNumber });
    if (!existingUser) {
      return errorResponse(res, 404, "User doesn't exist");
    }

    const premiumResult = await userHelper.handlePremium(
      existingUser,
      name,
      email,
      city
    );

    if (!premiumResult.success) {
      return errorResponse(res, 402, premiumResult.message);
    }

    return successResponse(res, 200, premiumResult.message, {
      premiumEndDate: premiumResult.premiumEndDate,
    });
  }),
  changeRoleController: asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const { role } = req.body;
    const { superAdminUserId: userId } = req.auth.userId;

    const modifiedUser = await userHelper.changeRole(
      superAdminUserId,
      user_id,
      role
    );
    if (!modifiedUser) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }
    return successResponse(
      modifiedUser,
      200,
      "Successfully changed user role."
    );
  }),

  getAllUsersController: asyncHandler(async (req, res) => {
    const { search, sortField, sortOrder, page = 1, limit = 10 } = req.query;
    const queryOptions = {
      search,
      sortField,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const { users, totalCount, totalPages } = await userHelper.getAllUser(
      queryOptions
    );

    if (!users) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    return successResponse(res, 200, "Successfully fetched users", {
      users,
      currentPage: queryOptions.page,
      totalPages,
      totalCount,
    });
  }),

  getUserController: asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
      return errorResponse(res, 400, "Id is required", userId);
    }
    const user = await userHelper.getUser(userId);
    if (!user) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR, user);
    }
    return successResponse(res, 200, "Successfully fetched user", user);
  }),
  DeleteUserClerkController: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clerkSecretKey}`,
      },
    });
    if (!response.ok) {
      return errorResponse(res, 500, "Failed to delete user");
    }
    const data = await response.json();
    return successResponse(res, 200, "Successfully deleted user", data);
  }),
};
