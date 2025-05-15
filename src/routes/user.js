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
  updateProfileController,
  toggleFollowController,
  getUserStatsController,
  getOtherUserController
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
router.post("/update-role/:user_id", conditionalAuth, changeRoleController);
router.get("/allocatedCalls", conditionalAuth, viewAllocatedCalls);
router.get("/all-users", getAllUsersController);

router.get("/user/:userId", conditionalAuth, getUserController);
router.delete("/user/:userId", conditionalAuth, DeleteUserClerkController);

router.put("/profile", conditionalAuth, updateProfileController);

router.post("/follow/:targetUserId", conditionalAuth, toggleFollowController);

router.get("/stats/:userId?", conditionalAuth, getUserStatsController);
router.get("/other-user/:userId", conditionalAuth, getOtherUserController);

module.exports = router;
