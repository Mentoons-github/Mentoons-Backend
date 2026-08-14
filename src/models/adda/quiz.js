const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, default: 0 },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  image: { type: String },
  icon: { type: String },
  answer: { type: String },
  options: {
    type: [optionSchema],
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 6,
      message: "Each question must have between 2 and 6 options",
    },
  },
});

const resultSchema = new mongoose.Schema({
  minScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  message: { type: String, required: true },
});

const quizSchema = new mongoose.Schema({
  category: { type: String, required: true },
  quizType: { type: String, enum: ["score", "knowledge"], default: "score" },
  questions: [questionSchema],
  results: [resultSchema],
});

module.exports = mongoose.model("Quiz", quizSchema);
