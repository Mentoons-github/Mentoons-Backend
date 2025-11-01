const express = require("express");
const router = express.Router();
const {
  requestLeave,
  approveLeave,
  cancelLeave,
  getAllLeaves,
  getEmployeeLeaves,
  rejectLeave,
  getLeaveStats,
} = require("../../controllers/employee/leave");
const { verifyRole } = require("../../middlewares/admin/adminAuth");

// Employee Routes
router.post("/request", verifyRole(["EMPLOYEE"]), requestLeave);
router.get("/my-leaves", verifyRole(["EMPLOYEE"]), getEmployeeLeaves);
router.put("/cancel/:id", verifyRole(["EMPLOYEE"]), cancelLeave);
router.get("/stats", verifyRole(["EMPLOYEE"]), getLeaveStats);

// Admin Routes
router.get("/all", verifyRole(["ADMIN"]), getAllLeaves);
router.put("/approve/:id", verifyRole(["ADMIN"]), approveLeave);
router.put("/reject/:id", verifyRole(["ADMIN"]), rejectLeave);

module.exports = router;
