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
      required: false,
    },
    meme: {
      type: Schema.Types.ObjectId,
      ref: "Meme",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes to ensure a user can only like a post or meme once
LikeSchema.index(
  { user: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true } } }
);
LikeSchema.index(
  { user: 1, meme: 1 },
  { unique: true, partialFilterExpression: { meme: { $exists: true } } }
);

// Method to check if a like exists
LikeSchema.statics.findLike = function (userId, type, id) {
  if (type === "post") return this.findOne({ user: userId, post: id });
  if (type === "meme") return this.findOne({ user: userId, meme: id });
  return null;
};

// Virtual for like URL
LikeSchema.virtual("url").get(function () {
  return `/likes/${this._id}`;
});

LikeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Like", LikeSchema);
