const express = require("express");
const {
  createInvitation,
  setPassword,
  handleProfileEditRequest,
} = require("../controllers/admin/employee");
const employeeRouter = require("./employee.js");
const {
  adminRegisterController,
  adminLoginController,
  makeAdmin,
  getUsersController,
  getOneUserController,
  blacklistUserController,
  viewSessionCalls,
  fetchAdmin,
  editAdmin,
  changePassword,
  getEmployeeTaskStats,
} = require("../controllers/admin.js");
const { isAdmin } = require("../middlewares/authMiddleware.js");
const { successResponse } = require("../utils/responseHelper");
const {
  adminAuthMiddleware,
} = require("../middlewares/adminAuthMiddleware.js");
const { verifyAdmin } = require("../middlewares/admin/adminAuth.js");
const {
  getAdminNotifications,
  markNotificationRead,
} = require("../controllers/adda/notification.js");

const router = express.Router();

router.patch("/employees/:id/profileEditRequest", handleProfileEditRequest);

router.use("/employee", employeeRouter);

router.get("/", verifyAdmin, fetchAdmin);
router.put("/edit", verifyAdmin, editAdmin);
router.get("/sessioncalls", viewSessionCalls);
router.post("/sign-in", adminRegisterController);
router.post("/login", adminLoginController);
router.get("/create-admin", adminAuthMiddleware, makeAdmin);
router.get("/users", getUsersController);
router.get("/users/:userId", getOneUserController);
router.delete("/users/:userId", blacklistUserController);
router.get("/checkrole", adminAuthMiddleware);

router.get("/user-stats", verifyAdmin, getEmployeeTaskStats)

router.post("/create-employee", adminAuthMiddleware, createInvitation);
router.patch("/change-password", adminAuthMiddleware, changePassword);
router.post("/set-password", setPassword);

router.get("/notifications", adminAuthMiddleware, getAdminNotifications);
router.patch("/:notificationId/read", verifyAdmin, markNotificationRead)

module.exports = router;
