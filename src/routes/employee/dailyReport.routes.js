const express = require("express");
const { verifyRole } = require("../../middlewares/admin/adminAuth");
const {
  submitReport,
  getMyReports,
  getAllReports,
  signReport,
  setDidAsDiscussed,
  getReportsByDate,
  getMySignature,
  saveMySignature,
  deleteMySignature,
} = require("../../controllers/employee/dailyTask");

const router = express.Router();
const ADMINS = ["ADMIN", "SUPER-ADMIN"];

router.post("/", verifyRole(["EMPLOYEE"]), submitReport);
router.get("/my-reports", verifyRole(["EMPLOYEE"]), getMyReports);

router.get("/", verifyRole(ADMINS), getAllReports);
router.get("/by-date", verifyRole(ADMINS), getReportsByDate);

router.get("/signature/me", verifyRole(ADMINS), getMySignature);
router.put("/signature/me", verifyRole(ADMINS), saveMySignature);
router.delete("/signature/me", verifyRole(ADMINS), deleteMySignature);

router.patch("/:id/discussed", verifyRole(ADMINS), setDidAsDiscussed);
router.patch("/:id/sign", verifyRole(ADMINS), signReport);

module.exports = router;
