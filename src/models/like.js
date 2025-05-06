const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const LikeSchema = new Schema(
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user can only like a post once
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

// Method to check if a like exists
LikeSchema.statics.findLike = function (userId, postId) {
  return this.findOne({ user: userId, post: postId });
};

// Virtual for like URL
LikeSchema.virtual("url").get(function () {
  return `/likes/${this._id}`;
});

LikeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Like", LikeSchema);
