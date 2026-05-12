const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    criteria: {
      action: {
        type: String,
        required: true,
      },
      field: {
        type: String,
        enum: ["count", "days", "pages"],
        required: true,
      },
      operator: {
        type: String,
        enum: [">=", "<=", ">", "<", "=="],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    animation: {
      type: Object,
    },
    image: {
      type: String,
      required: true,
    },
    xp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Badge", badgeSchema);
