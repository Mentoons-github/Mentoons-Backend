const express = require("express");
const { uploadFileController } = require("../controllers/fileUpload");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// authenticate before uploading
router.post("/file", uploadFileController);

module.exports = router;
