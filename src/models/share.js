const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const ShareSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    caption: {
      type: String,
      required: false,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    shareType: {
      type: String,
      enum: ["timeline", "direct", "external"],
      default: "timeline",
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    externalPlatform: {
      type: String,
      enum: ["facebook", "twitter", "whatsapp", "email", "other", null],
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to track sharing analytics
ShareSchema.index({ user: 1, post: 1 });

// Virtual for share URL
ShareSchema.virtual("url").get(function () {
  return `/shares/${this._id}`;
});

// Static method to find shares by post ID
ShareSchema.statics.findByPost = function (postId) {
  return this.find({ post: postId })
    .populate("user", "username profilePicture name")
    .sort({ createdAt: -1 });
};

// Static method to find shares by user ID
ShareSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId }).populate("post").sort({ createdAt: -1 });
};

ShareSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Share", ShareSchema);
