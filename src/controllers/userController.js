const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");
const userHelper = require("../helpers/userHelper");

module.exports = {
  registerController: asyncHandler(async (req, res) => {
    const { mobileNumber, countryCode } = req.body;

    // Validate required fields
    if (!mobileNumber || !countryCode) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.register(req.body);
    console.log("Register result", result);
    successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY);
  }),
  loginController: asyncHandler(async (req, res) => {
    const { mobileNumber, countryCode } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token", token);

    if (!mobileNumber || !countryCode) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.login({ mobileNumber, countryCode });
    console.log("Login result", result);
    successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY);
  }),

  verifyUserRegistrationController: asyncHandler(async (req, res) => {
    const { otp, mobileNumber } = req.body;
    if (!otp) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }
    const result = await userHelper.verifyUserRegistration(otp, mobileNumber);
    console.log("otp varification result", result);
    successResponse(res, 200, messageHelper.SUCCESSFULLY_REGISTERED_USER, result);
  }),

  verifyUserLoginController: asyncHandler(async (req, res) => {
    const { otp, mobileNumber } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!otp) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }
    const result = await userHelper.verifyUserLogin(mobileNumber, otp, token);
    console.log("otp varification result", result);
    successResponse(res, 200, messageHelper.SUCCESSFULLY_LOGGED_USER, result);
  }),

  logoutController: asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.logout(token);
    console.log("logoutResult", result);
    successResponse(res, 200, messageHelper.SUCCESSFULLY_LOGOUT_USER);
  }),
};
