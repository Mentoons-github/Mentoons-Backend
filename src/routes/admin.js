const express = require("express");
const {
  adminRegisterController,
  adminLoginController,
  makeAdmin,
  getUsersController,
  getOneUserController,
  blacklistUserController,
} = require("../controllers/admin.js");
const { isAdmin } = require("../middlewares/authMiddleware.js");
const { successResponse } = require("../utils/responseHelper");
const {
  adminAuthMiddleware,
} = require("../middlewares/adminAuthMiddleware.js");

const router = express.Router();

router.post("/sign-in", adminRegisterController);
router.post("/login", adminLoginController);
router.get("/create-admin", adminAuthMiddleware, makeAdmin);
router.get(
  "/private-content",
  adminAuthMiddleware,
  isAdmin,
  (req, res, next) => {
    return successResponse(res, 200, "Private Content");
  }
);
router.get("/users", getUsersController);
router.get("/users/:userId", getOneUserController);
router.delete("/users/:userId", blacklistUserController);

module.exports = router;
