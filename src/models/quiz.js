const mongoose = require('mongoose');

const answerSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  }
})

const questionSchema = mongoose.Schema({
  questionBg: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Question is required']
  },
  answer: {
    type: String,
    required: true,
  },
  answerImage:{
    type:String,
    required:true,
  },
  answerDescription:{
    type:String,
    required:true,
  },
  additionalDetails: {
    type: [answerSchema],
    required: true,
    validate: {
      validator: function (answers) {
        const imageCount = answers.filter(details => details.image).length;
        const textCount = answers.length;

        return imageCount <= 5 && textCount <= 5;
      },
      message: 'There must be up to 5 images and up to 5 text entries.',
    },
  },
})

const quizSchema = mongoose.Schema({
  quizCategory: {
    type: String,
    enum: ['INVENTORS AND INVENTIONS', 'MURDER MYSTRIES', 'OTHER'],
    required: [true, 'Quiz category is required']
  },
  quizDifficulty: {
    type: String,
    enum: ['6-12', '13-19', '20+'],
    required: [true, 'Please specify difficulty level']
  },
  subCategory: {
    type: String,
    enum: ['Stationary', 'Jewellery', 'Music', 'Clothing', 'Daily objects', 'Kitchen', 'Make-up', 'Technology'],
    required: [true, 'Please specify a sub category']
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: {
      validator: function (question) {
        return question.length >= 2 && question.length <= 5
      },
      message: 'A quiz must have between 2 and 5 questions.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  impressions: {
    type: Number,
    default: 0,
  }
})


const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
