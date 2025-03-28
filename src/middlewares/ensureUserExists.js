const User = require("../models/user");
const { clerkClient } = require("@clerk/express");

/**
 * Middleware to ensure a user exists in the database
 * If the user doesn't exist yet (webhook delay), create them on the fly
 */
const ensureUserExists = async (req, res, next) => {
  console.log("ensureUserExists middleware called");
  try {
    // Skip if no user is authenticated
    if (!req.auth || !req.auth.userId) {
      console.log("no user found");
      return next();
    }

    const clerkUserId = req.auth.userId;
    console.log("userId exists : ", clerkUserId);

    // Check if user exists in our database
    let user = await User.findOne({ clerkId: clerkUserId });

    console.log("use found : ", user);
    // If user doesn't exist, create them on the fly
    if (!user) {
      console.log(`User ${clerkUserId} not found in database, creating now...`);

      // Fetch user data from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      console.log("clerk User : ", clerkUser);
      // Create new user in our database
      user = new User({
        clerkId: clerkUserId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        profileImage: clerkUser.imageUrl || "",
        // Add any other fields you need
      });
      console.log("user saving");
      await user.save();
      console.log(`User ${clerkUserId} created successfully`);
    }

    // Attach the user to the request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in ensureUserExists middleware:", error);
    next(error);
  }
};

module.exports = ensureUserExists;
