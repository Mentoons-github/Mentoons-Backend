const { Clerk } = require("@clerk/clerk-sdk-node");

export const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const conditionalAuth = async (req, res, next) => {
  try {
    console.log("Request Query:", req.query);
    console.log("Authorization Header:", req.header("Authorization"));

    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

    console.log("user clerk :", user);

    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      membership: user.publicMetadata.membership || "FREE",
    };

    console.log("Authenticated User:", req.user);

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({ message: "User is not authorized", error });
  }
};

module.exports = {
  conditionalAuth,
  clerk,
};
