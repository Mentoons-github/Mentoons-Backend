const express = require("express");
const multer = require("multer");
const { verifyAdmin } = require("../../middlewares/admin/adminAuth");
const {
  allExternalCandidates,
  sendCandidateEmailByRecipients,
  unsubscribeCandidate,
  getCandidateEmailHistory,
  emailInbox,
} = require("../../controllers/admin/candidates");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", verifyAdmin, allExternalCandidates);

router.get("/email-inbox", verifyAdmin, emailInbox);
router.get("/emails", verifyAdmin, getCandidateEmailHistory);

router.post(
  "/send-email",
  verifyAdmin,
  upload.array("attachments"),
  sendCandidateEmailByRecipients,
);

router.get("/unsubscribe", unsubscribeCandidate);

module.exports = router;
