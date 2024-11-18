const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  childName: {
    type: String,
    required: true
  },
  childAge: {
    type: String,
    required: true
  },
  parentNames: {
    mother: {
      type: String,
      required: true
    },
    father: {
      type: String,
      required: true
    },
    carer: String
  },
  easeOfUseRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  learnings: {
    type: String,
    required: true
  },
  favoriteFeature: {
    type: String,
    enum: ['speak-easy', 'silent-stories-and-contest', 'menu-mania', 'all-of-the-above'],
    required: true
  },
  issues: {
    type: String,
    required: true
  },
  monitoringEaseRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  recommendationReason: {
    type: String,
    required: true
  },
  overallExperience: {
    type: String,
    enum: ['negative', 'neutral', 'positive'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);