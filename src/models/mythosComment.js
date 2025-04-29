const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mythosCommentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const MythosComment = mongoose.model("MythosComment", mythosCommentSchema);

module.exports = MythosComment;
