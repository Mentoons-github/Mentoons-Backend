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
    required: true,
    index: true,
  },
  maxStudents: {
    type: Number,
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["ongoing" | "upcoming" | "completed"],
    default: "upcoming",
  },
  startDate: {
    type: Date,
    default: () => new Date(),
  },
  endDate: {
    type: Date,
  },
});

module.exports = mongoose.model("workshopBatch", workshopBatchSchema);
