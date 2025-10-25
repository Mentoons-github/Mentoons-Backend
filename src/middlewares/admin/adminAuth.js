const User = require("../../models/user");
const { errorResponse } = require("../../utils/responseHelper");
const { clerk } = require("../auth.middleware");

const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return errorResponse(res, 401, "Authorization token is required.");
  }

  try {
    const session = await clerk.verifyToken(token);
    if (!session || !session.sub) {
      return errorResponse(res, 401, "Invalid or expired token.");
    }

    const clerkUser = await clerk.users.getUser(session.sub);
    if (!clerkUser) {
      return errorResponse(res, 404, "User not found in Clerk.");
    }

    if (clerkUser.publicMetadata?.role !== "ADMIN") {
      return errorResponse(res, 403, "Access denied. Admins only.");
    }

    const dbUser = await User.findOne({ clerkId: clerkUser.id });
    if (!dbUser) {
      return errorResponse(
        res,
        404,
        "User not found in the database. Please register first."
      );
    }

    req.user = {
      ...dbUser.toObject(),
      clerkRole: clerkUser.publicMetadata.role,
    };

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return errorResponse(res, 401, "Invalid or expired token.");
  }
};


const verifyRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    console.log("🛡️ [verifyRole] Middleware triggered. Allowed roles:", allowedRoles);

    const token = req.headers.authorization?.split(" ")[1];
    console.log("🔑 Extracted token:", token ? "✅ Present" : "❌ Missing");

    if (!token) {
      return errorResponse(res, 401, "Authorization token is required.");
    }

    try {
      // Verify token using Clerk
      const session = await clerk.verifyToken(token);
      console.log("📜 Clerk session:", session ? "✅ Valid" : "❌ Invalid");

      if (!session || !session.sub) {
        console.warn("⚠️ Invalid or expired token.");
        return errorResponse(res, 401, "Invalid or expired token.");
      }

      // Get user from Clerk
      const clerkUser = await clerk.users.getUser(session.sub);
      console.log("👤 Clerk user fetched:", clerkUser ? clerkUser.id : "❌ Not found");

      if (!clerkUser) {
        return errorResponse(res, 404, "User not found in Clerk.");
      }

      const userRole = clerkUser.publicMetadata?.role;
      console.log("🧾 Clerk user role:", userRole || "❌ No role assigned");

      // Role check
      if (!allowedRoles.includes(userRole)) {
        console.warn(`🚫 Access denied. Required: ${allowedRoles.join(", ")}, Found: ${userRole}`);
        return errorResponse(
          res,
          403,
          `Access denied. Allowed roles: ${allowedRoles.join(", ")}.`
        );
      }

      // Find user in DB
      const dbUser = await User.findOne({ clerkId: clerkUser.id });
      console.log("🗄️ DB user found:", dbUser ? dbUser._id : "❌ Not found in DB");

      if (!dbUser) {
        return errorResponse(
          res,
          404,
          "User not found in the database. Please register first."
        );
      }

      req.user = {
        ...dbUser.toObject(),
        clerkRole: userRole,
      };

      console.log("✅ [verifyRole] Access granted for role:", userRole);
      next();
    } catch (err) {
      console.error("❌ Token verification error:", err);
      return errorResponse(res, 401, "Invalid or expired token.");
    }
  };
};


module.exports = { verifyAdmin, verifyRole };
