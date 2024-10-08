const express = require("express");
const {
  getUser,
  registerController,
  loginController,
  makeAdmin,
} = require("../controllers/user.controllers");
const { verifyJWT, isAdmin } = require("../middlewares/auth.middleware");
const { successResponse } = require("../utils/responseHelper.utils");

const router = express.Router();

router.post("/sign-in", registerController);
router.post("/login", loginController);
router.get("/create-admin", verifyJWT, makeAdmin);
router.get("/private-content", verifyJWT, isAdmin, (req, res, next) => {
  return successResponse(res, 200, "Private Content");
});

module.exports = router;
