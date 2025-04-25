const express = require("express");
const {
  subscribeNewsletter,
  getLeadData,
  freeDownloadsRequest,
  freeDownloadsVerifyOtp,
  freeDownloadComic,
  sendEmailToUser,
  getAllNewsletters,
  sendQueryResponseEmail,
} = require("../controllers/emailController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/subscribeToNewsletter", subscribeNewsletter);
router.get("/newsletter-subscribers", getAllNewsletters);
router.post("/sendQueryResponseEmail", sendQueryResponseEmail);
router.post("/free-downloads", freeDownloadComic);
router.post("/freeDownloadClaim", freeDownloadComic);
router.get("/getLeadData", authMiddleware, getLeadData);
router.post("/sendEmail", sendEmailToUser);
router.post("/freeDownloadsVerify", freeDownloadsVerifyOtp);
router.post("/freeDownloadsReq", freeDownloadsRequest);

module.exports = router;
