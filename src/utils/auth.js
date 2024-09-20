const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const checkPassword = (plainPassword, encryptedPassword) => {
  try {
    return bcrypt.compareSync(plainPassword, encryptedPassword);
  } catch (error) {
    throw error;
  }
};

const createAccessToken = (input, secret) => {
  try {
    return jwt.sign(input, secret, { expiresIn: process.env.EXPIRES_IN });
  } catch (error) {
    throw error;
  }
};

const createRefreshToken = (input, secret) => {
  console.log(secret,'qwertyuiop');
  
  try {
    return jwt.sign(input, secret);
  } catch (error) {
    throw error;
  }
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  checkPassword,
  createAccessToken,
  createRefreshToken,
  verifyToken,
};
