const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");
const userHelper = require("../helpers/userHelper");
const Auth = require("../utils/auth");

module.exports = {
  registerController: asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.register(req.body);
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    const accessToken = Auth.createAccessToken({ phoneNumber }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = Auth.createRefreshToken({ phoneNumber }, process.env.REFRESH_TOKEN_SECRET);

    return successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY, { result, accessToken, refreshToken });
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

    const accessToken = Auth.createAccessToken({ phoneNumber }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = Auth.createRefreshToken({ phoneNumber }, process.env.REFRESH_TOKEN_SECRET);

    return successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY, { result, accessToken, refreshToken });
  }),

  verifyUserRegistrationController: asyncHandler(async (req, res) => {
    const { otp, phoneNumber } = req.body;

    if (!otp) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.verifyUserRegistration(otp, phoneNumber);
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }

    const accessToken = Auth.createAccessToken({ phoneNumber }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = Auth.createRefreshToken({ phoneNumber }, process.env.REFRESH_TOKEN_SECRET);

    return successResponse(res, 200, messageHelper.SUCCESSFULLY_REGISTERED_USER, { result, accessToken, refreshToken });
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

    const accessToken = Auth.createAccessToken({ phoneNumber }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = Auth.createRefreshToken({ phoneNumber }, process.env.REFRESH_TOKEN_SECRET);

    return successResponse(res, 200, messageHelper.SUCCESSFULLY_LOGGED_USER, { result, accessToken, refreshToken });
  }),
 
  logoutController: asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.logout(token);
    if (!result) {
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }
    return successResponse(res, 200, messageHelper.SUCCESSFULLY_LOGOUT_USER, result);
  }),

  refreshTokenController: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    try {
      const decoded = Auth.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const accessToken = Auth.createAccessToken({ phoneNumber: decoded.phoneNumber }, process.env.ACCESS_TOKEN_SECRET);
      return successResponse(res, 200, messageHelper.TOKEN_REFRESHED, { accessToken });
    } catch (error) {
      return errorResponse(res, 401, messageHelper.INVALID_REFRESH_TOKEN);
    }
  }),
};
