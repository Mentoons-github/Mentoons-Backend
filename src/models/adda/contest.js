const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 5,
    },
    mobile: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "social media logos",
        "accessories",
        "daily stationary items",
        "gadgets",
        "musicians",
        "animated movie characters",
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", ContestSchema);
