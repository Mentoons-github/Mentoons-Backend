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
  DeleteUserClerkController,
  changeRoleController,
  viewAllocatedCalls,
} = require("../controllers/userController.js");
const { isSuperAdminOrAdmin } = require("../middlewares/authMiddleware.js");
const { conditionalAuth } = require("../middlewares/auth.middleware.js");

const router = express.Router();
router.post("/register", registerController);
router.post("/register/verify", verifyUserRegistrationController);
router.post("/login", loginController);
router.post("/login/verify", verifyUserLoginController);
router.post("/logout", logoutController);
router.post("/premium", premiumController);
router.post(
  "/update-role/:user_id",
  requireAuth({ signInUrl: "/sign-in" }),
  changeRoleController
);
router.get(
  "/allocatedCalls",
  requireAuth({ signInUrl: "/sign-in" }),
  viewAllocatedCalls
);
router.get(
  "/all-users",
  // requireAuth({ signInUrl: "/sign-in" }),
  getAllUsersController
);

router.get(
  "/user/:userId",
  conditionalAuth,
  getUserController
);
router.delete(
  "/user/:userId",
  requireAuth({ signInUrl: "/sign-in" }),
  DeleteUserClerkController
);

module.exports = router;
