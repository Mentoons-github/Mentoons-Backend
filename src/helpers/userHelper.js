require("dotenv").config();
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const requestCall = require("../models/requestCall");

module.exports = {
  createUser: async (data) => {
    const {
      id,
      email_addresses,
      image_url,

      first_name,
      last_name,
    } = data;
    console.log(id, "id");

    const newUser = await User.create({
      clerkId: id,
      name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
      email: email_addresses[0]?.email_address,

      picture: image_url,
    });
    await newUser.save();
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
    try {
      console.log("Fetching user with ID:", userId);
      const [user] = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
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
};
