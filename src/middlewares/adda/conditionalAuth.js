const { Clerk } = require("@clerk/clerk-sdk-node");
const User = require("../../models/user");

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const addaConditionalAuth = async (req, res, next) => {
  try {
    console.log("Request Query:", req.query);
    console.log("Authorization Header:", req.header("Authorization"));

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

    console.log("user clerk :", user);

    req.user = {
      id: user.id,
      dbUser: DBUser,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      membership: user.publicMetadata.membership || "FREE",
    };

    console.log("Authenticated User:", req.user);

    return next();
  } catch (error) {
    console.log("Authentication Error:", error);
    return next();
  }
};

module.exports = {
  addaConditionalAuth,
  clerk,
};
