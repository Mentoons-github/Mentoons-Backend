const express = require("express");
const {
  createInvitation,
  setPassword,
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
} = require("../controllers/admin.js");
const { isAdmin } = require("../middlewares/authMiddleware.js");
const { successResponse } = require("../utils/responseHelper");
const {
  adminAuthMiddleware,
} = require("../middlewares/adminAuthMiddleware.js");

const router = express.Router();

router.use("/employee", employeeRouter);

router.get("/sessioncalls", viewSessionCalls);
router.post("/sign-in", adminRegisterController);
router.post("/login", adminLoginController);
router.get("/create-admin", adminAuthMiddleware, makeAdmin);
router.get("/users", getUsersController);
router.get("/users/:userId", getOneUserController);
router.delete("/users/:userId", blacklistUserController);
router.get("/checkrole", adminAuthMiddleware);

router.post("/create-employee", adminAuthMiddleware, createInvitation);
router.post("/set-password", setPassword);

module.exports = router;
