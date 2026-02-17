const mongoose = require("mongoose");

const workshopBatchSchema = new mongoose.Schema({
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  psychologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    // required: true,
    default: null,
    index: true,
  },
  maxStudents: {
    type: Number,
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkshopStudents",
    },
  ],
  status: {
    type: String,
    enum: ["draft", "upcoming", "ongoing", "completed"],
    default: "draft",
  },
  currentSession: {
    type: Number,
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
  },
});

module.exports = mongoose.model("workshopBatch", workshopBatchSchema);
