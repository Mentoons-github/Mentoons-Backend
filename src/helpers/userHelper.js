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
          },
        },
        { $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
      ]);

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
    console.log(userId, "userId");
    try {
      console.log("Fetching user with ID:", userId);
      const [user] = await User.aggregate([
        { $match: { _id: userId } },
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
        bio,
        location,
        coverImage,
        dateOfBirth,
        picture,
        interests,
        socialLinks,
        privacySettings,
      } = profileData;

      console.log(userId, "userId");
      console.log(picture, "picture");
      const clerkProfileImageUpload = await fetch(
        `https://api.clerk.com/v1/users/${userId}/profile_image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
          body: JSON.stringify({ image_url: picture }),
        }
      );

      console.log(clerkProfileImageUpload, "clerkProfileImageUpload");

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(bio && { bio }),
            ...(location && { location }),
            ...(coverImage && { coverImage }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(interests && { interests }),
            ...(socialLinks && { socialLinks }),
            ...(privacySettings && { privacySettings }),
            lastActive: new Date(),
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
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

  // Get user stats (followers count, posts count, etc.)
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
};
