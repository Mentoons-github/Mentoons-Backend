const { register } = require("../controllers/userController");
const User = require("../models/user");
const messageHelper = require("../utils/messageHelper");
const { errorResponse } = require("../utils/responseHelper");
const Auth = require("../utils/auth");
const bcrypt = require("bcrypt");

module.exports = {
  register: async (data) => {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      const error = new Error("User already exists with this email");
      error.code = "409";
      throw error;
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      parseInt(process.env.SALT_ROUND)
    );

    const refreshToken = Auth.createRefreshToken(
      { name: data.name, email: data.email },
      process.env.REFRESH_TOKEN_SECRET
    );

    const newUser = await User.create({
      ...data,
      password: hashedPassword,
      refreshToken: refreshToken,
    });
    console.log(newUser);

    return newUser;
  },

  login: async (data) => {
    const user = await User.findOne({ email: data.email });

    let accessToken = data?.token;
    if (!user) {
      const error = new Error("Invalid credentials");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const passwordMatch = await Auth.checkPassword(
      data.password,
      user.password
    );

    if (!passwordMatch) {
      const error = new Error("Invalid credentials");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    if (accessToken) {
      try {
        const verifyToken = Auth.verifyToken(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
      } catch (error) {
        accessToken = Auth.createAccessToken(
          { name: user.name, email: user.email },
          process.env.ACCESS_TOKEN_SECRET
        );
      }
    } else {
      accessToken = Auth.createAccessToken(
        { name: user.name, email: user.email },
        process.env.ACCESS_TOKEN_SECRET
      );
    }

    const userDetails = {
      name: user.name,
      email: user.email,
      accessToken: accessToken,
    };

    return userDetails;
  },
};
