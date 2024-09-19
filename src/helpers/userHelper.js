const User = require("../models/user");
const bcrypt = require("bcrypt");

const Auth = require("../utils/auth");
const whatsappMessage = require("../services/twillioWhatsappService");
const { createOtp, hashData } = require("../utils/functions");

module.exports = {
  register: async (data) => {
    const { mobileNumber, countryCode } = data;

    const existingUser = await User.findOne({
      countryCode: countryCode,
      mobileNumber: mobileNumber,
    });
    if (existingUser) {
      const error = new Error("Phone number is already registered.");
      error.code = "409";
      throw error;
    }

    const phoneNumber = `${countryCode}${mobileNumber}`;
    const otp = await createOtp();
    const hashedOtp = await hashData(otp);
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    const newUser = await User.create({
      mobileNumber: mobileNumber,
      countryCode: countryCode,
      otp: hashedOtp,
      otpExpiresAt: otpExpiresAt,
    });

    whatsappMessage(`Your 6 digit OTP is: ${otp}`, phoneNumber);
    return newUser;
  },

  //verify route
  verifyUserRegistration: async (otp, mobileNumber) => {
    console.log(otp);
    const user = await User.findOne({ mobileNumber: mobileNumber });
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
    mobileNumber,
      process.env.REFRESH_TOKEN_SECRET
    );

    user.refreshToken = refreshtoken;
    await user.save();
    return true;
  },

  login: async (data) => {
    const { mobileNumber, countryCode } = data;

    const existingUser = await User.findOne({
      countryCode: countryCode,
      mobileNumber: mobileNumber,
    });
    if (!existingUser) {
      const error = new Error("Phone number is Not registered.");
      error.code = "400";
      throw error;
    }

    const phoneNo = `${countryCode}${mobileNumber}`;
    const otp = await createOtp();
    const hashedOtp = await hashData(otp);
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    existingUser.otp = hashedOtp;
    existingUser.otpExpiresAt = otpExpiresAt;

    whatsappMessage(`Your 6 digit OTP is: ${otp}`, phoneNo);

    await existingUser.save();

    return existingUser;
  },
  verifyUserLogin: async (mobileNumber,otp, token) => {
    const user = await User.findOne({ mobileNumber:mobileNumber});

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
        userDetails.mobileNumber = user.mobileNumber;
        userDetails.accessToken = token;
      }
    } else {
      const accessToken = Auth.createAccessToken(
        { mobileNumber: user.mobileNumber },
        user.refreshToken
      );

      userDetails.mobileNumber = user.mobileNumber;
      userDetails.accessToken = accessToken;
    }

    return userDetails;
  },
  logout: async (token) => {
    const verifyToken = Auth.verifyToken(token);
    console.log(verifyToken);
    const user = await User.findOne({ mobileNumber: verifyToken.mobileNumber });
    return user;
  },
};
