const Quiz = require("../../models/adda/quiz");
const asyncHandler = require("../../utils/asyncHandler");

const getQuizzes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";

  const skip = (page - 1) * limit;

  const query = search ? { category: { $regex: search, $options: "i" } } : {};

  const quizzes = await Quiz.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalQuizzes = await Quiz.countDocuments(query);
  const totalPages = Math.ceil(totalQuizzes / limit);

  return res.status(200).json({
    success: true,
    data: {
      quizzes,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuizzes,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    },
  });
});

const getQuizById = asyncHandler(async (req, res) => {
  console.log("reached controller");
  const { id } = req.params;
  console.log(id);

  const quiz = await Quiz.findById(id).lean();
  console.log("quiz :", quiz);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: quiz,
  });
});

const uploadQuiz = asyncHandler(async (req, res) => {
  const { category, questionsAndOptions, results } = req.body;
  console.log("results: ", results);

  if (!category) {
    return res.status(404).json({ message: "No category found" });
  }

  if (!questionsAndOptions || questionsAndOptions.length === 0) {
    return res.status(404).json({ message: "No questions and options found" });
  }

  let quiz = await Quiz.findOne({ category });

  if (quiz) {
    quiz.questions.push(...questionsAndOptions);

    if (results) quiz.results = results;

    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
    });
  } else {
    quiz = new Quiz({
      category,
      questions: questionsAndOptions,
      results: results || [],
    });

    await quiz.save();
    return res.status(200).json({
      success: true,
      message: "Quiz added successfully",
    });
  }
});

const replaceQuestion = asyncHandler(async (req, res) => {
  const { newQuestion, questionId } = req.body;
  const { id } = req.params;

  const quiz = await Quiz.findById(id);

  if (!quiz) {
    return res.status(404).json({
      message: "No quiz found",
    });
  }

  const questionIndex = quiz.questions.findIndex((q) => q._id === questionId);
  if (questionIndex === -1) {
    return res.status(404).json({ message: "No question found" });
  }

  quiz.questions[questionIndex] = newQuestion;

  await quiz.save();

  return res.status(200).json({
    success: true,
    message: "New question updated",
  });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId, categoryId } = req.params;

  const quiz = await Quiz.findByIdAndUpdate(
    categoryId,
    {
      $pull: {
        questions: { _id: questionId },
      },
    },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    quiz,
    message: "Quiz question removed successfully",
  });
});

const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Quiz.findByIdAndDelete(id);

  return res
    .status(200)
    .json({ success: true, message: "Quiz deleted successfully" });
});

const getAllCategories = asyncHandler(async (req, res) => {
  console.log("reached quiz category");
  const quizzes = await Quiz.find();
  console.log(quizzes);
  if (quizzes.length === 0) {
    return res.status(404).json({ message: "No quiz found" });
  }

  const categories = quizzes.map((quiz) => ({
    category: quiz.category,
    _id: quiz._id,
  }));

  console.log(categories);

  return res.status(200).json({ categories });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const totalScore = answers.reduce((sum, ans) => sum + ans.score, 0);

  const result = quiz.results.find(
    (r) => totalScore >= r.minScore && totalScore <= r.maxScore
  );

  return res.status(200).json({
    success: true,
    totalScore,
    result: result ? result.message : "No matching score range",
  });
});

module.exports = {
  uploadQuiz,
  replaceQuestion,
  deleteQuestion,
  deleteQuiz,
  getQuizzes,
  getQuizById,
  getAllCategories,
  submitQuiz,
};
