const User = require("../models/user");
const bcrypt = require("bcrypt");
const Auth = require("../utils/auth");
const whatsappMessage = require("../services/twillioWhatsappService");
const { createOtp, hashData } = require("../utils/functions");

module.exports = {
  register: async (data) => {
    const { phoneNumber } = data;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      const error = new Error("Phone number is already registered.");
      error.code = "409";
      throw error;
    }

    const otp = "1234"; // For testing purposes, replace with createOtp() in production
    const hashedOtp = await hashData(otp);

    const newUser = await User.create({
      phoneNumber,
      otp: hashedOtp,
    });

    await newUser.save();

    whatsappMessage(`Your 4 digit OTP is: ${otp}`, phoneNumber);
    return newUser;
  },

  verifyUserRegistration: async (otp, phoneNumber) => {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      const error = new Error("User with this phone Number not found");
      error.code = "400";
      throw error;
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      const error = new Error("Invalid OTP");
      error.code = "400";
      throw error;
    }

    const refreshToken = Auth.createRefreshToken({ phoneNumber }, process.env.REFRESH_TOKEN_SECRET);
    const hashedRefreshToken = await hashData(refreshToken);

    user.refreshToken = hashedRefreshToken;
    await user.save();
    return true;
  },

  login: async (data) => {
    const { phoneNumber } = data;
    console.log(phoneNumber,'phoneNumber')
    const existingUser = await User.findOne({ phoneNumber });
    if (!existingUser) {
      const error = new Error("Phone number is not registered.");
      error.code = "400";
      throw error;
    }

    const otp = "1234"; 
    // const otp = createOtp();
    const hashedOtp = await hashData(otp);

    existingUser.otp = hashedOtp;
    await existingUser.save();

    whatsappMessage(`Your 6 digit OTP is: ${otp}`, phoneNumber);

    return true;
  },

  verifyUserLogin: async (phoneNumber, otp, token) => {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      const error = new Error("User with this phone Number not found");
      error.code = "400";
      throw error;
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      const error = new Error("Invalid OTP");
      error.code = "400";
      throw error;
    }

    let userDetails = {};

    if (token) {
      const verifyToken = await Auth.verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
      if (verifyToken) {
        userDetails.phoneNumber = user.phoneNumber;
        userDetails.accessToken = token;
      }
    } else {
      const accessToken = Auth.createAccessToken({ phoneNumber: user.phoneNumber }, process.env.ACCESS_TOKEN_SECRET);
      userDetails.phoneNumber = user.phoneNumber;
      userDetails.accessToken = accessToken;
    }

    return userDetails;
  },

  logout: async (token) => {
    const verifyToken = Auth.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(verifyToken,'verifyToken')
    if (!verifyToken) {
      const error = new Error("Access Token expired please login again");
      error.code = "401";
      throw error;
    }
    const user = await User.findOne({ phoneNumber: verifyToken.phoneNumber });
    if (!user) {
      const error = new Error("User with this phone Number not found");
      error.code = "400";
      throw error;
    }
    let userDetails = {
      phoneNumber: user.phoneNumber,
    };
    return userDetails;
  },
  handlePremium: async (existingUser, name, email, city) => {
    const currentDate = new Date();

    if (existingUser.isFirstLogin) {
      // Grant 3 days of premium
      existingUser.isFirstLogin = false;
      existingUser.premiumStartDate = currentDate;
      existingUser.premiumEndDate = new Date(
        currentDate.getTime() + 3 * 24 * 60 * 60 * 1000
      );
      existingUser.isPremiumUser = true;
      existingUser.name = name;
      existingUser.email = email;
      existingUser.city = city;
    } else if (existingUser.premiumEndDate < currentDate) {
      // Premium has expired
      return {
        success: false,
        message: "Your premium subscription has expired.",
      };
    } else {
      // Premium is already active
      return {
        success: true,
        message: "Premium already active",
        premiumEndDate: existingUser.premiumEndDate,
      };
    }

    await existingUser.save();
    return {
      success: true,
      message: "Free 3-day premium activated",
      premiumEndDate: existingUser.premiumEndDate,
    };
  },
};
