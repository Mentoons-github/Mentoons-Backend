const express = require("express");
const { submitContestForm } = require("../../controllers/adda/contest");

const router = express.Router();

router.post("/submit", submitContestForm);

module.exports = router;
