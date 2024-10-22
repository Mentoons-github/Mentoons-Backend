const express = require("express");
const { uploadFileController } = require("../controllers/fileUpload");
const { requireAuth } = require("@clerk/express");

const router = express.Router();

router.post("/file",  requireAuth({ signInUrl: "/sign-in" }), uploadFileController);

module.exports = router;
