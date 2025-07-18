const User = require("../models/user");
const { errorResponse } = require("../utils/responseHelper");
const { clerk } = require("./auth.middleware");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return errorResponse(res, 401, "Authorization token is required.");
  }

  try {
    const session = await clerk.verifyToken(token);

    if (!session || !session.sub) {
      return errorResponse(res, 401, "Invalid or expired token.");
    }

    const user = await clerk.users.getUser(session.sub);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const DBUser = await User.findOne({ clerkId: user.id });

    if (!DBUser) {
      return errorResponse(
        res,
        404,
        "User not found in the database. Please register first."
      );
    }

    req.user = DBUser._id;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return errorResponse(res, 401, "Invalid or expired token.");
  }
};

module.exports = verifyToken;
