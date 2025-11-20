const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema(
  {
    name: String,
    age: Number,
    mobile: Number,
    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", ContestSchema);
