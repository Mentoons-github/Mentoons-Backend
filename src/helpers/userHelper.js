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
    const otp = "1234"
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;
    const hashedOtp = await hashData(otp);

    const newUser = await User.create({
      phoneNumber: phoneNumber,
      otp: hashedOtp,
      otpExpiresAt: otpExpiresAt,
    });

    whatsappMessage(`Your 4 digit OTP is: ${otp}`, mobileNumber);
    return newUser;
  },

  //verify route
  verifyUserRegistration: async (otp, phoneNumber) => {
    console.log(otp);
    console.log(phoneNumber)
    const user = await User.findOne({ phoneNumber: phoneNumber });
    console.log(user);

    if (!user || Date.now() > user.otpExpiresAt) {
      const error = new Error("Invalid or expired OTP");
      error.code = "400";
      throw error;
    }

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

    user.refreshToken = refreshtoken;
    await user.save();
    return true;
  },

  login: async (data) => {
    const { phoneNumber } = data;

    const existingUser = await User.findOne({
      phoneNumber: phoneNumber,
    });
    if (!existingUser) {
      const error = new Error("Phone number is Not registered.");
      error.code = "400";
      throw error;
    }

    const mobileNumber = `${phoneNumber}`;
    // const otp = await createOtp();
    const otp = "1234";
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const hashedOtp = await hashData(otp);

    existingUser.otp = hashedOtp;
    existingUser.otpExpiresAt = otpExpiresAt;

    whatsappMessage(`Your 6 digit OTP is: ${otp}`, mobileNumber);

    await existingUser.save();

    return true;
  },
  verifyUserLogin: async (phoneNumber, otp, token) => {
    const user = await User.findOne({ phoneNumber: phoneNumber });

    let userDetails = {};

    if (!user || Date.now() > user.otpExpiresAt) {
      const error = new Error("Invalid or expired OTP");
      error.code = "400";
      throw error;
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      const error = new Error("Invalid OTP");
      error.code = "400";
      throw error;
    }
    if (token) {
      const verifyToken = await Auth.verifyToken(token);
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
  logout: async (token) => {
    const verifyToken = Auth.verifyToken(token);
    console.log(verifyToken);
    const user = await User.findOne({ phoneNumber: verifyToken.phoneNumber });
    return user;
  },
};
