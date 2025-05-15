const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const MemeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    shares: [
      {
        type: Schema.Types.ObjectId,
        ref: "Share",
      },
    ],
    shareCount: {
      type: Number,
      default: 0,
    },
    saves: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    saveCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
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

// Virtual for meme URL
MemeSchema.virtual("url").get(function () {
  return `/memes/${this._id}`;
});

// Method to check if a user has liked the meme
MemeSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.equals(userId));
};

// Method to like a meme
MemeSchema.methods.like = async function (userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push(userId);
    this.likeCount += 1;
    await this.save();
    return true;
  }
  return false;
};

// Method to unlike a meme
MemeSchema.methods.unlike = async function (userId) {
  if (this.isLikedBy(userId)) {
    this.likes = this.likes.filter((id) => !id.equals(userId));
    this.likeCount = Math.max(0, this.likeCount - 1);
    await this.save();
    return true;
  }
  return false;
};

// Method to check if a user has saved the meme
MemeSchema.methods.isSavedBy = function (userId) {
  return this.saves.some((save) => save.equals(userId));
};

// Method to save a meme
MemeSchema.methods.saveMeme = async function (userId) {
  if (!this.isSavedBy(userId)) {
    this.saves.push(userId);
    this.saveCount += 1;
    await this.save();
    return true;
  }
  return false;
};

// Method to unsave a meme
MemeSchema.methods.unsaveMeme = async function (userId) {
  if (this.isSavedBy(userId)) {
    this.saves = this.saves.filter((id) => !id.equals(userId));
    this.saveCount = Math.max(0, this.saveCount - 1);
    await this.save();
    return true;
  }
  return false;
};

// Method to add a comment
MemeSchema.methods.addComment = async function (commentId) {
  this.comments.push(commentId);
  this.commentCount += 1;
  await this.save();
};

// Method to remove a comment
MemeSchema.methods.removeComment = async function (commentId) {
  this.comments = this.comments.filter((id) => !id.equals(commentId));
  this.commentCount = Math.max(0, this.commentCount - 1);
  await this.save();
};

// Method to add a share
MemeSchema.methods.addShare = async function (shareId) {
  this.shares.push(shareId);
  this.shareCount += 1;
  await this.save();
};

// Pre-save hook to update the updatedAt field
MemeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

MemeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Meme", MemeSchema);
