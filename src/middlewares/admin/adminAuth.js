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
    return errorResponse(res, 401, "Invalid or expired token.");
  }
};

const verifyRole = (allowedRoles = []) => {
  return async (req, res, next) => {
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

      const userRole = clerkUser.publicMetadata?.role;

      if (!allowedRoles.includes(userRole)) {
        return errorResponse(
          res,
          403,
          `Access denied. Allowed roles: ${allowedRoles.join(", ")}.`
        );
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
        clerkRole: userRole,
      };

      next();
    } catch (err) {
      return errorResponse(res, 401, "Invalid or expired token.");
    }
  };
};

module.exports = { verifyAdmin, verifyRole };
