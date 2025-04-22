const Admin = require("../models/admin");
const User = require("../models/user");
const { verifyToken } = require("../utils/auth");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  adminAuthMiddleware: async (req, res, next) => {
    const { check } = req.query;

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return errorResponse(res, 401, "Authorization header is missing");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return errorResponse(res, 401, "Token is missing");
      }

      let decoded;
      try {
        decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded token:", decoded);
      } catch (error) {
        return errorResponse(res, 401, "Invalid or expired token");
      }

      let user = await Admin.findOne({ phoneNumber: decoded.phoneNumber });

      if (user) {
        if (check === "true") {
          return successResponse(res, 200, { role: "admin", success: true });
        }

        req.user = user;
        return next();
      }

      user = await User.findOne({ p: decoded.phoneNumber });

      if (!user) {
        return errorResponse(res, 401, "User not found");
      }

      if (!["ADMIN", "SUPERADMIN"].includes(user.role)) {
        return errorResponse(
          res,
          403,
          "Access denied: Insufficient permissions"
        );
      }

      if (check === "true") {
        return successResponse(res, 200, { role: user.role, success: true });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Admin Auth Middleware Error:", error);
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }
  },
};
