const { Clerk } = require("@clerk/clerk-sdk-node");
const Admin = require("../models/admin");
const User = require("../models/user");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

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

      let session;
      try {
        session = await clerk.sessions.verifySession(token);
        console.log("[Middleware] Clerk session verified:", session);
      } catch (err) {
        console.log("[Middleware] Clerk session verification failed:", err);
        return errorResponse(res, 401, "Invalid or expired Clerk token");
      }

      let clerkUser;
      try {
        clerkUser = await clerk.users.getUser(session.userId);
        console.log("[Middleware] Clerk user fetched:", clerkUser.id);
      } catch (error) {
        console.log("[Middleware] Clerk user fetch failed:", error);
        return errorResponse(res, 401, "Clerk user not found");
      }

      let user = await User.findOne({ clerkId: clerkUser.id });
      if (!user) {
        console.log("[Middleware] No user found with Clerk ID:", clerkUser.id);
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
};
