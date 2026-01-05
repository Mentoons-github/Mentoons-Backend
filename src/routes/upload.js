const express = require("express");
const { uploadFileController, uploadFileMentorMahesh } = require("../controllers/fileUpload");

const router = express.Router();

router.post("/file", uploadFileController);
router.post("/file/mentor-mahesh/:userName", uploadFileMentorMahesh)

module.exports = router;
