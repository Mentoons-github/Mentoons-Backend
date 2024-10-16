const express = require("express");

const {
  registerController,
  loginController,
  logoutController,
  verifyUserRegistrationController,
  verifyUserLoginController,
  premiumController,
} = require("../controllers/userController.js");

const router = express.Router();
router.post("/register", registerController);
router.post("/register/verify", verifyUserRegistrationController);
router.post("/login", loginController);
router.post("/login/verify", verifyUserLoginController);
router.post("/logout", logoutController);
router.post("/premium", premiumController);

module.exports = router;
