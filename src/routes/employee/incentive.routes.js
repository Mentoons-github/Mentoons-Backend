const express = require("express");
const { verifyRole } = require("../../middlewares/admin/adminAuth");
const {
  getEmployeeIncentives,
  getIncentiveById,
  updateIncentiveStatus,
} = require("../../controllers/employee/incentive");

const router = express.Router();
router.get("/", verifyRole(["EMPLOYEE"]), getEmployeeIncentives);
router.get("/:id", verifyRole(["EMPLOYEE", "ADMIN"]), getIncentiveById);

router.patch("/", verifyRole(["ADMIN"]), updateIncentiveStatus);

module.exports = router;
