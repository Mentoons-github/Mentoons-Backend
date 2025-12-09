const User = require("../../models/user");
const { errorResponse } = require("../../utils/responseHelper");
const { clerk } = require("./conditionalAuth");

const addaAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid token");
      return next();
    }

    const token = authHeader.split(" ")[1];

    const session = await clerk.verifyToken(token);
    if (!session || !session.sub) {
      console.log("Invalid or expired token");
      return next();
    }

    const user = await clerk.users.getUser(session.sub);
    if (!user) {
      console.log("User not found");
      return next();
    }

    const DBUser = await User.findOne({ clerkId: user.id });

    if (!DBUser) {
      console.log("User not found in the database. Please register first.");
      return next();
    }

    req.user = {
      id: user.id,
      dbUser: DBUser,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      membership: user.publicMetadata.membership || "FREE",
    };

    return next();
  } catch (error) {
    console.log("Authentication Error:", error);
    return errorResponse(res, 401, "Invalid or expired token.");
  }
};

module.exports = {
  addaAuth,
};
