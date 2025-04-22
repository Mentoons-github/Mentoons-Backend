const Admin = require("../models/admin");
const User = require("../models/user");
const { verifyToken } = require("../utils/auth");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  adminAuthMiddleware: async (req, res, next) => {
    const { check } = req.query;

    try {
      console.log("[Middleware] Starting adminAuthMiddleware...");

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        console.log("[Middleware] Authorization header missing");
        return errorResponse(res, 401, "Authorization header is missing");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        console.log("[Middleware] Token missing");
        return errorResponse(res, 401, "Token is missing");
      }

      let decoded;
      try {
        decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("[Middleware] Decoded token:", decoded);
      } catch (error) {
        console.log("[Middleware] Token verification failed:", error);
        return errorResponse(res, 401, "Invalid or expired token");
      }

      let user = await Admin.findOne({ phoneNumber: decoded.phoneNumber });
      console.log("[Middleware] Checked Admin collection");

      if (user) {
        console.log("[Middleware] Admin user found:", user.phoneNumber);
        if (check === "true") {
          console.log("[Middleware] Returning admin role check response");
          return successResponse(res, 200, { role: "admin", success: true });
        }

        req.user = user;
        return next();
      }

      console.log("[Middleware] Not an Admin, checking User collection...");
      user = await User.findOne({ phoneNumber: decoded.phoneNumber }); // Fixed from `p` to `phoneNumber`

      if (!user) {
        console.log("[Middleware] No user found in User collection");
        return errorResponse(res, 401, "User not found");
      }

      console.log("[Middleware] User found in User collection:", user.role);

      if (!["ADMIN", "SUPERADMIN"].includes(user.role)) {
        console.log("[Middleware] User lacks admin/superadmin permissions");
        return errorResponse(
          res,
          403,
          "Access denied: Insufficient permissions"
        );
      }

      if (check === "true") {
        console.log("[Middleware] Returning user role check response");
        return successResponse(res, 200, { role: user.role, success: true });
      }

      req.user = user;
      console.log("[Middleware] Proceeding to next middleware/route");
      next();
    } catch (error) {
      console.error("[Middleware] Admin Auth Middleware Error:", error);
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }
  },
};
