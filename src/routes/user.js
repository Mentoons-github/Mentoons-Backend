const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  registerController,
  loginController,
  logoutController,
  verifyUserRegistrationController,
  verifyUserLoginController,
  premiumController,
  getAllUsersController,
  getUserController,
} = require("../controllers/userController.js");
const { isSuperAdminOrAdmin } = require("../middlewares/authMiddleware.js");

const router = express.Router();
router.post("/register", registerController);
router.post("/register/verify", verifyUserRegistrationController);
router.post("/login", loginController);
router.post("/login/verify", verifyUserLoginController);
router.post("/logout", logoutController);
router.post("/premium", premiumController);
router.get(
  "/all-users",
  requireAuth({ signInUrl: "/sign-in" }),
  getAllUsersController
);

router.get(
  "/user",
  requireAuth({ signInUrl: "/sign-in" }),
  getUserController
);
module.exports = router;
