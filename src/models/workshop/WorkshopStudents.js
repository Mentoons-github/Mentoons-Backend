const mongoose = require("mongoose");

const workshopStudentsSchema = new mongoose.Schema({
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
    index: true,
  },
  workshopBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "workshopBatch",
    index: true,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  motherName: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },

  scoring: {
    type: {
      totalSessions: {
        type: Number,
        required: true,
        default: 0,
      },

      completedSessions: {
        type: Number,
        default: 0,
      },

      sessions: [
        {
          sessionName: {
            type: String,
            required: true,
          },
          sessionNumber: {
            type: Number,
            required: true,
          },
          sessionDate: {
            type: Date,
            required: true,
          },
          scors: {
            type: {
              headings: [
                {
                  headingIndex: Number,

                  headingScore: {
                    type: Number,
                    default: 0,
                  },

                  questions: [
                    {
                      questionIndex: Number,
                      score: Number,
                    },
                  ],
                },
              ],
              totalScore: {
                type: Number,
                default: 0,
              },
            },
          },
          psychologist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
          },
        },
      ],
    },
    default: null,
  },
});

module.exports = mongoose.model("WorkshopStudents", workshopStudentsSchema);
