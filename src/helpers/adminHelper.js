const Admin = require("../models/admin");

module.exports = {
  registerUser: async (data) => {
    const { name, email, password, role } = data;

    const existingUser = await Admin.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      throw new Error("Email is already taken");
    }

    const user = await Admin.create({
      name,
      email,
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
};
