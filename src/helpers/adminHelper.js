const Admin = require("../models/admin");
const Session = require("../models/session");

module.exports = {
  registerUser: async (data) => {
    const { name, email, password, phoneNumber, role } = data;

    const existingUser = await Admin.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    console.log(existingUser);
    if (existingUser) {
      throw new Error("Email/PhoneNumber is already taken");
    }

    const user = await Admin.create({
      name,
      email,
      phoneNumber,
      password,
      role,
    });

    if (!user) {
      throw new Error("Something went wrong while registering the user.");
    }

    const createdUser = await Admin.findById(user._id).select(
      "-password -refreshToken"
    );

    return createdUser;
  },
  loginUser: async (data) => {
    const { email, password } = data;
    const existingUser = await Admin.findOne({ email });
    if (!existingUser) {
      throw new Error("User does not exist");
    }
    const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      throw new Error("Invalid Password");
    }

    const { password: pass, refreshToken, ...rest } = existingUser?._doc;

    return rest;
  },
  // generate access and refresh token
  generateAccessAndRefreshToken: async (userId) => {
    try {
      const user = await Admin.findById(userId);
      if (!user) {
        throw new Error("User doesn't exists");
      }
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error(error);
    }
  },

  getAllUsersFromDB: async () => {
    try {
      const users = await Admin.find({});
      console.log(users);
      return users;
    } catch (err) {
      console.log("something went wrong while retrieving user data");
      throw new Error(err);
    }
  },

  getOneUserFromDB: async (userId) => {
    try {
      const user = await Admin.findById(userId);
      if (!user) {
        return null;
      }
      return user;
    } catch (err) {
      console.log("Something went wrong while retrieving user data");
      throw new Error(err);
    }
  },

  blacklistUser: async (userId) => {
    try {
      const user = await Admin.findByIdAndDelete(userId);
      if (!user) {
        return null;
      }
      return user;
    } catch (err) {
      console.log("something went wrong while blacklisting a user");
      throw new Error(err);
    }
  },
  getAllSessionCalls: async (
    search = "",
    sortField = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10
  ) => {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(search, "i");

    let matchedConditions = {};

    if (search) {
      matchedConditions.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
      ];
    }

    console.log("aggregating the query")

    const allocatedCalls = await Session.aggregate([
      { $match: matchedConditions },
      {
        $lookup: {
          from: "employees",
          localField: "psychologistId",
          foreignField: "_id",
          as: "psychologist",
        },
      },
      { $unwind: { path: "$psychologist", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          psychologistName: "$psychologist.name",
          status: 1,
          description: 1,
          createdAt: 1,
        },
      },
      { $sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const totalCount = await Session.countDocuments(matchedConditions);

    return {
      allocatedCalls,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  },
};
