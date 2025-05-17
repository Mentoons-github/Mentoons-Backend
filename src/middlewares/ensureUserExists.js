const User = require("../models/user");
const { clerkClient, getAuth } = require("@clerk/express");

const ensureUserExists = async (req, res, next) => {
  if (req.path === "/api/v1/payment/ccavenue-response") {
    return next();
  }

  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      console.log("No user found in auth");
      return next();
    }

    console.log("User ID exists:", clerkUserId);

    let user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      console.log(`User ${clerkUserId} not found, creating...`);
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      user = new User({
        clerkId: clerkUserId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        profileImage: clerkUser.imageUrl || "",
      });

      await user.save();
      console.log(`User ${clerkUserId} created successfully`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in ensureUserExists middleware:", error);
    next(error);
  }
};

module.exports = ensureUserExists;
