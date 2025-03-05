const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createAccessToken = (input, secret) => {
  try {
    return jwt.sign(input, secret, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: "HS256",
    });
  } catch (error) {
    throw error;
  }
};

const createRefreshToken = (input, secret) => {
  try {
    return jwt.sign(input, secret, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: "HS256",
    });
  } catch (error) {
    throw error;
  }
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret, { algorithm: "HS256" });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyToken,
};
