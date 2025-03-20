const nodemailer = require('nodemailer');

const dontenv = require('dotenv');
dontenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

module.exports = { transporter };