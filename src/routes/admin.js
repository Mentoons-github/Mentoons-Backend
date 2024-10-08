const express = require("express");
const {
  adminRegisterController,
  adminLoginController,
  makeAdmin,
} = require("../controllers/admin.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const { successResponse } = require("../utils/responseHelper");

const router = express.Router();

router.post("/sign-in", adminRegisterController);
router.post("/login", adminLoginController);
router.get("/create-admin", authMiddleware, makeAdmin);
router.get("/private-content", authMiddleware, isAdmin, (req, res, next) => {
  return successResponse(res, 200, "Private Content");
});

module.exports = router;
