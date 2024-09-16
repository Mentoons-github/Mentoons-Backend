const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");
const userHelper = require("../helpers/userHelper");

module.exports = {
  registerController: asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name && !email && !password && !phone) {
      errorResponse(res, 400, messageHelper.MISSING_REQUIRED_FIELDS);
    }

    const result = await userHelper.register({
      name,
      email,
      password,
      phone,
    });
    console.log("Register result", result);
    successResponse(
      res,
      201,
      messageHelper.SUCCESSFULLY_REGISTERED_USER,
      result
    );
  }),
  loginController: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token", token);

    if (!email || !password) {
      errorResponse(res, 400, messageHelper.MISSING_CREDENTIALS);
    }

    const result = await userHelper.login({ email, password, token });
    console.log("Login result", result);
    successResponse(res, 200, messageHelper.SUCCESSFULLY_LOGGED_USER, result);
  }),
};
