const { Clerk } = require("@clerk/clerk-sdk-node");
const User = require("../models/user");
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const conditionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("req token n ot found");
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    const session = await clerk.verifyToken(token);
    if (!session || !session.sub) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await clerk.users.getUser(session.sub);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const DBUser = await User.findOne({ clerkId: user.id });

    if (!DBUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found in the database. Please register first.",
      });
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

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({ message: "User is not authorized", error });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message:
          "You are not logged in. Please log in to access this resource.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = {
  conditionalAuth,
  clerk,
  restrictTo,
};
