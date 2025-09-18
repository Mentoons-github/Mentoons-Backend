const { verifyToken } = require("@clerk/backend");
const Admin = require("../models/admin");
const User = require("../models/user");
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

      let payload;
      try {
        payload = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        console.log("[Middleware] Token verified:", payload.sub);
      } catch (err) {
        console.log("[Middleware] Clerk token verification failed:", err);
        return errorResponse(res, 401, "Invalid or expired Clerk token");
      }

      const clerkUserId = payload.sub;

      let user = await User.findOne({ clerkId: clerkUserId });
      if (!user) {
        console.log("[Middleware] No user found with Clerk ID:", clerkUserId);
        return errorResponse(res, 401, "User not found");
      }

      console.log("[Middleware] User found:", user.role);

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
  optionalAdminMiddleware: async (req, res, next) => {
    const { check } = req.query;
    try {
      console.log("[Middleware] Starting optionalAdminMiddleware...");

      const authHeader = req.headers.authorization;

      if (!authHeader) {
        console.log(
          "[Middleware] No authorization header provided, proceeding"
        );
        if (check === "true") {
          return successResponse(res, 200, { role: null, success: true });
        }
        req.user = null;
        return next();
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        console.log("[Middleware] Token missing, proceeding");
        if (check === "true") {
          return successResponse(res, 200, { role: null, success: true });
        }
        req.user = null;
        return next();
      }

      let payload;
      try {
        payload = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        console.log("[Middleware] Token verified:", payload.sub);
      } catch (err) {
        console.log("[Middleware] Clerk token verification failed:", err);
        if (check === "true") {
          return successResponse(res, 200, { role: null, success: true });
        }
        req.user = null;
        return next();
      }

      const clerkUserId = payload.sub;

      const user = await User.findOne({ clerkId: clerkUserId });
      if (!user) {
        console.log("[Middleware] No user found with Clerk ID:", clerkUserId);
        if (check === "true") {
          return successResponse(res, 200, { role: null, success: true });
        }
        req.user = null;
        return next();
      }

      console.log("[Middleware] User found:", user.role);

      if (["ADMIN", "SUPERADMIN"].includes(user.role)) {
        req.user = user;
        console.log("[Middleware] Admin/Superadmin user attached:", user.role);
      } else {
        req.user = null;
        console.log("[Middleware] User lacks admin permissions, proceeding");
      }

      if (check === "true") {
        console.log("[Middleware] Returning user role check response");
        return successResponse(res, 200, {
          role: user.role || null,
          success: true,
        });
      }

      console.log("[Middleware] Proceeding to next middleware/route");
      next();
    } catch (error) {
      console.error("[Middleware] Optional Admin Middleware Error:", error);
      return errorResponse(res, 500, messageHelper.INTERNAL_SERVER_ERROR);
    }
  },
};
