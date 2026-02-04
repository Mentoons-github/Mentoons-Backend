const express = require("express");
const {
  createDataCapture,
  fetchDataCaptureDetails,
  fetchSingleDataCaptureDetails,
  addReviewOnDataCapture,
  editDataCapture,
  addScoringSystem,
} = require("../../controllers/employee/dataCaptureController.js");
const { verifyRole } = require("../../middlewares/admin/adminAuth.js");

const router = express.Router();

router.post("/create", verifyRole(["EMPLOYEE"]), createDataCapture);
router.put("/edit/:dataCaptureId", verifyRole(["EMPLOYEE"]), editDataCapture);
router.get("/fetch", verifyRole(["EMPLOYEE"]), fetchDataCaptureDetails);
router.get(
  "/fetch-single/:dataCaptureId",
  verifyRole(["EMPLOYEE"]),
  fetchSingleDataCaptureDetails,
);
router.put(
  "/add-review/:dataCaptureId",
  verifyRole(["EMPLOYEE"]),
  addReviewOnDataCapture,
);
router.put(
  "/add-score/:dataCaptureId",
  verifyRole(["EMPLOYEE"]),
  addScoringSystem,
);

module.exports = router;
