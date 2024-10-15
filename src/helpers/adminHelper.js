const Admin = require("../models/admin");

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
        throw new Error("User does not exist");
      }
      return user;
    } catch (err) {
      console.log("Something went wrong while retrieving user data");
      throw new Error(err);
    }
  },

  // blacklistUser: async (userId) => {
  //   try {
  //     const user = await Admin.findById(userId);

  //     if (!user) {
  //       return null;
  //     }
  //   } catch (err) {
  //     console.log("something went wrong while blacklisting a user");
  //     throw new Error(err);
  //   }
  // },
};
