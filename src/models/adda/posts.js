const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video", "article", "event"],
      required: true,
    },
    files: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: false,
    },
    articleContent: {
      type: String,
      required: function () {
        return this.type === "article";
      },
    },
    eventDetails: {
      eventDate: {
        type: Date,
        required: function () {
          return this.type === "event";
        },
      },
      location: {
        type: String,
        required: function () {
          return this.type === "event";
        },
      },
      additionalInfo: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);

const Posts = mongoose.models.Post || mongoose.model("Post", postSchema);
module.exports = Posts;
