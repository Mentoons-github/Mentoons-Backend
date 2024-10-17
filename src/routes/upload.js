const express = require("express");
const { uploadFileController } = require("../controllers/fileUpload");

const router = express.Router();

router.post("/file", uploadFileController);

module.exports = router;
