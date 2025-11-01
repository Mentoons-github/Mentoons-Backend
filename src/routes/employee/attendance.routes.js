const express = require("express");
const { verifyRole } = require("../../middlewares/admin/adminAuth");
const {
  getAttendanceData,
  checkIn,
  checkOut,
} = require("../../controllers/employee/attendance");

const router = express.Router();

router.get(
  "/my-attendance",
  verifyRole(["ADMIN", "EMPLOYEE"]),
  getAttendanceData
);
router.post("/check-in", verifyRole(["EMPLOYEE"]), checkIn);
router.post("/check-out", verifyRole(["EMPLOYEE"]), checkOut);

module.exports = router;
