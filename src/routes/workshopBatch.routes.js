const express = require("express");
const {
  getAllWorkshopBatches,
  assignWorkshopBatchtoPsychologist,
  getSinglePsychologistWorkshopBatches,
  getSingleWorkshopBatch,
  addWorkshopScoring,
  updateWorkshopScoring,
} = require("../controllers/workshop/workshopBatchController");
const { verifyRole } = require("../middlewares/admin/adminAuth");

const router = express.Router();

router.get(
  "/all-batches",
  verifyRole(["ADMIN", "EMPLOYEE"]),
  getAllWorkshopBatches,
);
router.get(
  "/single-batch/:workshopBatchId",
  verifyRole(["ADMIN", "EMPLOYEE"]),
  getSingleWorkshopBatch,
);
router.put(
  "/assign-batch",
  verifyRole(["ADMIN"]),
  assignWorkshopBatchtoPsychologist,
);
router.get(
  "/psychologist/batches",
  verifyRole(["EMPLOYEE"]),
  getSinglePsychologistWorkshopBatches,
);
router.put(
  "/scoring/:sutudentId",
  verifyRole(["EMPLOYEE"]),
  addWorkshopScoring,
);
router.put(
  "/scoring/edit/:sutudentId/:sessionId",
  verifyRole(["EMPLOYEE"]),
  updateWorkshopScoring,
);

module.exports = router;
