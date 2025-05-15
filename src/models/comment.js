const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
    meme: {
      type: Schema.Types.ObjectId,
      ref: "Meme",
      required: false,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        url: {
          type: String,
          required: false,
        },
        type: {
          type: String,
          enum: ["image", "video", "gif"],
          required: false,
        },
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Virtual for comment URL
CommentSchema.virtual("url").get(function () {
  return `/comments/${this._id}`;
});

// Method to check if a user has liked the comment
CommentSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.equals(userId));
};

// Static method to find comments by post or meme
CommentSchema.statics.findByTarget = function (type, id) {
  if (type === "post") {
    return this.find({ post: id, parentComment: null })
      .populate("user", "username profilePicture name")
      .populate({
        path: "replies",
        populate: { path: "user", select: "username profilePicture name" },
      })
      .sort({ createdAt: -1 });
  }
  if (type === "meme") {
    return this.find({ meme: id, parentComment: null })
      .populate("user", "username profilePicture name")
      .populate({
        path: "replies",
        populate: { path: "user", select: "username profilePicture name" },
      })
      .sort({ createdAt: -1 });
  }
  return null;
};

// Pre-save hook to update the updatedAt field
CommentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

CommentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Comment", CommentSchema);
