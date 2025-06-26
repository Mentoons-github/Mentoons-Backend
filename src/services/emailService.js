const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Failed to connect to Gmail:", err);
  } else {
    console.log("✅ Email server is ready");
  }
});

const sendEmail = async (mailOptions) => {
  try {
    console.log(
      "data =========>",
      process.env.EMAIL_PASS,
      process.env.EMAIL_USER
    );
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendEmail };
