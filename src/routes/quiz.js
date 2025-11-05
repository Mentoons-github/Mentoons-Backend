const express = require("express");
const { createQuiz } = require("../controllers/quiz");

const router = express.Router();

router.route("/").post(createQuiz);

module.exports = router;
