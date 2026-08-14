const {
  deleteQuestion,
  deleteQuiz,
  replaceQuestion,
  uploadQuiz,
  getQuizById,
  getQuizzes,
  getAllCategories,
} = require("../../controllers/adda/quiz");
const express = require("express");
const verifyToken = require("../../middlewares/addaMiddleware");
const { quizUpload } = require("../../middlewares/file/createUpload");

const router = express.Router();

router.get("/categories", getAllCategories);
router.use(verifyToken);
router.post("/add", quizUpload, uploadQuiz);
router.delete("/question/:categoryId/:questionId", deleteQuestion);
router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.route("/:id").put(replaceQuestion).delete(deleteQuiz);

module.exports = router;
