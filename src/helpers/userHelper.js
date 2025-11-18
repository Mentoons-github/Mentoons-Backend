require("dotenv").config();
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const requestCall = require("../models/requestCall");

module.exports = {
  createUser: async (data) => {
    const { id, email_addresses, image_url, first_name, last_name } = data;
    console.log(id, "id");

    const newUser = await User.findOneAndUpdate(
      { clerkId: id },
      {
        name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
        email: email_addresses[0]?.email_address,
        picture: image_url,
      },
      {
        upsert: true,
        new: true,
      }
    );
    return newUser;
  },
  updateUser: async (data) => {
    console.log("updated user", data);
    const {
      id,
      email_addresses,
      image_url,
      first_name,
      last_name,
      public_metadata,
    } = data;
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id.toString() },
      {
        name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
        email: email_addresses[0]?.email_address,
        picture: image_url,
        role: public_metadata.role,
      },
      {
        new: true,
      }
    );
    return updatedUser;
  },
  deleteUser: async (data) => {
    console.log("deleted User", data);
    const { id } = data;

    const deletedUser = await User.findOneAndDelete({
      clerkId: id.toString(),
    });

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return deletedUser;
  },
  changeRole: async (superAdminUserId, user_id, role) => {
    const superAdminUser = await User.findOne({
      clerkId: superAdminUserId,
      role: "SUPER-ADMIN",
    });
    if (!superAdminUser) {
      throw new Error("Super Admin not found");
    }

    const user = await User.findOne({
      clerkId: user_id,
      role: { $ne: "SUPER-ADMIN" },
    });
    console.log(user, "user");
    if (!user) {
      throw new Error("User not found");
    }
    const modifiedUser = await fetch(
      `https://api.clerk.com/v1/users/${user_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          public_metadata: { role: role },
        }),
      }
    );
    return modifiedUser;
  },

  getAllUser: async ({
    search = "",
    sortField = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
    filter = {},
  }) => {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(search, "i");

      const matchConditions = {
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
        role: { $nin: ["ADMIN", "SUPER-ADMIN", "EMPLOYEE"] },
      };

      if (filter.role && filter.role !== "") {
        matchConditions.role = filter.role;
      }
      const allUsers = await User.aggregate([
        {
          $match: matchConditions,
        },
        {
          $lookup: {
            from: "requestcalls",
            localField: "assignedCalls",
            foreignField: "_id",
            as: "assignedCalls",
          },
        },
        {
          $project: {
            _id: 1,
            clerkId: 1,
            role: 1,
            name: 1,
            email: 1,
            picture: 1,
            bio: 1,
            location: 1,
            coverImage: 1,
            dateOfBirth: 1,
            joinedDate: 1,
            lastActive: 1,
            followers: 1,
            following: 1,
            friends: 1,
            socialLinks: 1,
            subscription: 1,
            assignedCalls: 1,
            isBlocked: 1,
          },
        },
        { $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]);

      console.log(allUsers, "allUsers");

      const totalCount = await User.countDocuments(matchConditions);

      return {
        users: allUsers,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error("Error in getAllUser:", error.message);
      console.error("Stack trace:", error.stack);
      throw new Error(`Error fetching users from database: ${error.message}`);
    }
  },

  getUser: async (userId) => {
    try {
      const [user] = await User.aggregate([
        { $match: { _id: userId, role: { $nin: ["EMPLOYEE", "ADMIN"] } } },
        {
          $lookup: {
            from: "requestcalls",
            localField: "assignedCalls",
            foreignField: "_id",
            as: "assignedCalls",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followers",
            foreignField: "_id",
            as: "followers",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "following",
            foreignField: "_id",
            as: "following",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "friends",
            foreignField: "_id",
            as: "friends",
          },
        },
        {
          $project: {
            _id: 1,
            clerkId: 1,
            role: 1,
            name: 1,
            email: 1,
            picture: 1,
            bio: 1,
            location: 1,
            coverImage: 1,
            dateOfBirth: 1,
            joinedDate: 1,
            lastActive: 1,
            followers: 1,
            following: 1,
            friends: 1,
            socialLinks: 1,
            subscription: 1,
            assignedCalls: 1,
            interests: 1,
            privacySettings: 1,
            education: 1,
            gender: 1,
            phoneNumber: 1,
            occupation: 1,
            subscriptionLimits: 1,
          },
        },
      ]);
      if (!user) {
        console.error(`User with ID ${userId} not found.`);
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Error fetching user from database");
    }
  },

  // Update profile information
  updateProfile: async (userId, profileData) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        location,
        dateOfBirth,
        gender,
        bio,
        education,
        occupation,
        interests,
        socialLinks,
        picture,
        coverImage,
        privacySettings,
      } = profileData;

      // Only validate fields that are provided in profileData
      const mandatoryFields = [
        { key: "name", value: name, message: "Name is required" },
        { key: "email", value: email, message: "Email is required" },
        {
          key: "phoneNumber",
          value: phoneNumber,
          message: "Phone number is required",
        },
        { key: "location", value: location, message: "Location is required" },
        {
          key: "dateOfBirth",
          value: dateOfBirth,
          message: "Date of birth is required",
        },
        { key: "gender", value: gender, message: "Gender is required" },
      ];

      // Validate only if the field is provided
      for (const field of mandatoryFields) {
        if (
          field.value !== undefined &&
          (field.value === null || String(field.value).trim() === "")
        ) {
          console.log(`Validation error: ${field.message}`);
          throw new Error(field.message);
        }
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log("Validation error: Invalid email format");
        throw new Error("Invalid email format");
      }

      if (phoneNumber && !/^\+?[\d\s-]{10,}$/.test(phoneNumber)) {
        console.log("Validation error: Invalid phone number format");
        throw new Error("Invalid phone number format");
      }

      const validGenders = ["male", "female", "other", "prefer-not-to-say"];
      if (gender && !validGenders.includes(gender)) {
        console.log("Validation error: Invalid gender value");
        throw new Error("Invalid gender value");
      }

      if (socialLinks) {
        if (!Array.isArray(socialLinks)) {
          console.log("Validation error: Social links must be an array");
          throw new Error("Social links must be an array");
        }
        for (const link of socialLinks) {
          if (!link.label || !link.url) {
            console.log(
              "Validation error: Each social link must have a label and URL"
            );
            throw new Error("Each social link must have a label and URL");
          }
          try {
            new URL(link.url);
          } catch {
            console.log(
              `Validation error: Invalid URL format for social link: ${link.url}`
            );
            throw new Error(`Invalid URL format for social link: ${link.url}`);
          }
        }
      }

      if (interests && !Array.isArray(interests)) {
        console.log("Validation error: Interests must be an array");
        throw new Error("Interests must be an array");
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(name && { name }),
            ...(email && { email }),
            ...(phoneNumber && { phoneNumber }),
            ...(location && { location }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(gender && { gender }),
            ...(bio && { bio }),
            ...(education && { education }),
            ...(occupation && { occupation }),
            ...(interests && { interests }),
            ...(socialLinks && { socialLinks }),
            ...(picture && { picture }),
            ...(coverImage && { coverImage }),
            ...(privacySettings && { privacySettings }),
            lastActive: new Date(),
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        console.log("Error: User not found for ID:", userId);
        throw new Error("User not found");
      }

      console.log("Updated user:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  },

  // Follow/unfollow user
  toggleFollow: async (userId, targetUserId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new Error("Target user not found");
      }

      // Check if already following
      const isFollowing = user.following.includes(targetUserId);

      if (isFollowing) {
        // Unfollow
        await User.findByIdAndUpdate(userId, {
          $pull: { following: targetUserId },
        });
        await User.findByIdAndUpdate(targetUserId, {
          $pull: { followers: userId },
        });
        return { action: "unfollowed" };
      } else {
        // Follow
        await User.findByIdAndUpdate(userId, {
          $addToSet: { following: targetUserId },
        });
        await User.findByIdAndUpdate(targetUserId, {
          $addToSet: { followers: userId },
        });

        // Add notification
        await User.findByIdAndUpdate(targetUserId, {
          $push: {
            notifications: {
              type: "follow",
              from: userId,
              content: "started following you",
              isRead: false,
              createdAt: new Date(),
            },
          },
        });

        return { action: "followed" };
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      throw new Error(`Error toggling follow: ${error.message}`);
    }
  },

  viewAllocatedCalls: async (
    userId,
    search = "",
    sortField = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10
  ) => {
    try {
      const user = await User.findOne({ clerkId: userId });

      if (!user) {
        throw new Error("User not found");
      }

      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(search, "i");

      const matchConditions = { assignedTo: user._id };
      if (search) {
        matchConditions.$or = [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ];
      }

      const allocatedCalls = await requestCall.aggregate([
        { $match: matchConditions },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            requestedTopic: 1,
            status: 1,
            createdAt: 1,
          },
        },
        { $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]);

      const totalCount = await requestCall.countDocuments(matchConditions);

      return {
        allocatedCalls,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error("Error in viewAllocatedCalls:", error);
      throw new Error(error.message);
    }
  },

  getUserStats: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      return {
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: user.posts.length,
        friendsCount: user.friends.length,
        groupsCount: user.groups.length,
        subscription: user.subscription,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  },

  getOtherUserDetails: async (userId) => {
    try {
      console.log("Fetching public details for user with ID:", userId);

      const objectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null;

      if (!objectId) {
        console.error(`Invalid user ID format: ${userId}`);
        throw new Error("Invalid user ID format");
      }

      const [user] = await User.aggregate([
        { $match: { _id: objectId } },
        {
          $project: {
            _id: 1,
            name: 1,
            picture: 1,
            bio: 1,
            location: 1,
            coverImage: 1,
            joinedDate: 1,
            lastActive: 1,
            followers: { $size: { $ifNull: ["$followers", []] } },
            following: { $size: { $ifNull: ["$following", []] } },
            friends: { $size: { $ifNull: ["$friends", []] } },
            socialLinks: 1,
          },
        },
      ]);

      if (!user) {
        console.error(`User with ID ${userId} not found in database.`);
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      console.error("Error fetching user public details:", error);
      throw new Error(`Error fetching user public details: ${error.message}`);
    }
  },

  updateSubscriptionLimits: async (userId, subscriptionLimits) => {
    console.log("Inside helper");
    console.log(userId, "userId");
    console.log(subscriptionLimits, "subscriptionLimits");
    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          subscriptionLimits: {
            ...subscriptionLimits,
          },
        },
      },
      { new: true }
    );
    return user;
  },
};
