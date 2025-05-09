const User = require("../models/user");

/**
 * Middleware to check if the authenticated user has admin privileges
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check if user has admin role
    if (
      !["admin", "super-admin", "ADMIN", "SUPERADMIN"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = isAdmin;
