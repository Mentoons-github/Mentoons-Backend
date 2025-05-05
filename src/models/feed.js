const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const FeedSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    preferences: {
      showLikes: {
        type: Boolean,
        default: true,
      },
      showComments: {
        type: Boolean,
        default: true,
      },
      showShares: {
        type: Boolean,
        default: true,
      },
      prioritizeFollowing: {
        type: Boolean,
        default: true,
      },
      contentTypes: {
        type: [String],
        enum: ["text", "photo", "video", "article", "event", "mixed"],
        default: ["text", "photo", "video", "article", "event", "mixed"],
      },
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
    lastPostId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    hiddenPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followingUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    topics: [
      {
        type: String,
      },
    ],
    refreshRate: {
      type: Number,
      default: 15, // in minutes
      min: 5,
      max: 60,
    },
  },
  { timestamps: true }
);

// Virtual for feed URL
FeedSchema.virtual("url").get(function () {
  return `/feeds/${this._id}`;
});

// Method to check if a post is hidden
FeedSchema.methods.isPostHidden = function (postId) {
  return this.hiddenPosts.some((id) => id.equals(postId));
};

// Method to check if a post is saved
FeedSchema.methods.isPostSaved = function (postId) {
  return this.savedPosts.some((id) => id.equals(postId));
};

// Method to check if a user is blocked
FeedSchema.methods.isUserBlocked = function (userId) {
  return this.blockedUsers.some((id) => id.equals(userId));
};

// Method to check if a user is followed
FeedSchema.methods.isUserFollowed = function (userId) {
  return this.followingUsers.some((id) => id.equals(userId));
};

FeedSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Feed", FeedSchema);
