const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, required: true },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },

  options: {
    type: [optionSchema],
    validate: {
      validator: (arr) => arr.length === 3,
      message: "Each question must have exactly 3 options",
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
  questions: [questionSchema],
  results: [resultSchema],
});

module.exports = mongoose.model("Quiz", quizSchema);
