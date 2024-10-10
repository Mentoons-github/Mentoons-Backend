const express = require("express");
const {
  subscribeNewsletter,
  getLeadData,
  freeDownloadsRequest,
  freeDownloadsVerifyOtp,
  freeDownloadComic,
} = require("../controllers/emailController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/subscribeToNewsletter", subscribeNewsletter);
router.post("/freeDownloadsReq", freeDownloadsRequest);
router.post("/freeDownloadClaim", freeDownloadComic);
router.post("/freeDownloadsVerify", freeDownloadsVerifyOtp);
router.get("/getLeadData", authMiddleware, getLeadData);

module.exports = router;
