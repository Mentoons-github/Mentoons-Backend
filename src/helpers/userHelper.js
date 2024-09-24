const User = require("../models/user");
const bcrypt = require("bcrypt");

const Auth = require("../utils/auth");
const whatsappMessage = require("../services/twillioWhatsappService");
const { createOtp, hashData } = require("../utils/functions");

module.exports = {
  register: async (data) => {
    const { phoneNumber } = data;

    const existingUser = await User.findOne({
      phoneNumber: phoneNumber,
    });
    if (existingUser) {
      const error = new Error("Phone number is already registered.");
      error.code = "409";
      throw error;
    }

    const mobileNumber = `${phoneNumber}`;
    // const otp = await createOtp();
    const otp = "1234";
    // const otpExpiresAt = Date.now() + 10 * 60 * 1000;
    const hashedOtp = await hashData(otp);

    const newUser = await User.create({
      phoneNumber: phoneNumber,
      otp: hashedOtp,
      // otpExpiresAt: otpExpiresAt,
    });

    await newUser.save();

    whatsappMessage(`Your 4 digit OTP is: ${otp}`, mobileNumber);
    return newUser;
  },

  //verify route
  verifyUserRegistration: async (otp, phoneNumber) => {
    const user = await User.findOne({ phoneNumber: phoneNumber });
    console.log(user);

    if (!user) {
      const error = new Error("User with this phone Number not found");
      error.code = "400";
      throw error;
    }

    // if (Date.now() > user.otpExpiresAt) {
    //   const error = new Error("Invalid or expired OTP");
    //   error.code = "400";
    //   throw error;
    // }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      const error = new Error("Invalid OTP");
      error.code = "400";
      throw error;
    }

    const refreshtoken = Auth.createRefreshToken(
      phoneNumber,
      process.env.REFRESH_TOKEN_SECRET
    );

    const hashedRefreshToken = await hashData(refreshtoken);

    user.refreshToken = hashedRefreshToken;
    await user.save();
    return true;
  },

  login: async (data) => {
    const { phoneNumber } = data;

    const existingUser = await User.findOne({
      phoneNumber: phoneNumber,
    });
    if (!existingUser) {
      const error = new Error("Phone number is not registerd.");
      error.code = "400";
      throw error;
    }

    const mobileNumber = `${phoneNumber}`;
    // const otp = await createOtp();
    const otp = "1234";
    // const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const hashedOtp = await hashData(otp);

    existingUser.otp = hashedOtp;
    // existingUser.otpExpiresAt = otpExpiresAt;
    await existingUser.save();

    whatsappMessage(`Your 6 digit OTP is: ${otp}`, mobileNumber);


    return true;
  },
  verifyUserLogin: async (phoneNumber, otp, token) => {
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      const error = new Error("User with this phone Number not found");
      error.code = "400";
      throw error;
    }

    let userDetails = {};

    // if (Date.now() > user.otpExpiresAt) {
    //   const error = new Error("Invalid or expired OTP");
    //   error.code = "400";
    //   throw error;
    // }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      const error = new Error("Invalid OTP");
      error.code = "400";
      throw error;
    }
    if (token) {
      const verifyToken = await Auth.verifyToken(token, user.refreshToken);
      if (verifyToken) {
        userDetails.phoneNumber = user.phoneNumber;
        userDetails.accessToken = token;
      }
    } else {
      const accessToken = Auth.createAccessToken(
        { phoneNumber: user.phoneNumber },
        user.refreshToken
      );

      userDetails.phoneNumber = user.phoneNumber;
      userDetails.accessToken = accessToken;
    }

    return userDetails;
  },
  logout: async (token, phoneNumber) => {
    const user = await User.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      const error = new Error("User with this phone Number not found");
      error.code = "400";
      throw error;
    }
    const verifyToken = Auth.verifyToken(token, user.refreshToken);
    if (!verifyToken) {
      const error = new Error("Access Token expired please login again");
      error.code = "401";
      throw error;
    }

    let userDetails = {
      phoneNumber: user.phoneNumber,
    };
    return userDetails;
  },
};
