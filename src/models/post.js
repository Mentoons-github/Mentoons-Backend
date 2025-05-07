const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const PostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    postType: {
      type: String,
      enum: ["text", "photo", "video", "article", "event", "mixed"],
      required: false,
      default: "text",
    },
    media: [
      {
        url: {
          type: String,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: false,
        },
        caption: {
          type: String,
          required: false,
        },
      },
    ],
    article: {
      body: {
        type: String,
        required: false,
      },
      coverImage: {
        type: String,
        required: false,
      },
    },
    event: {
      startDate: {
        type: Date,
        required: false,
      },
      endDate: {
        type: Date,
        required: false,
      },
      venue: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      coverImage: {
        type: String,
        required: false,
      },
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    tags: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      required: false,
    },
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

// Virtual for post URL
PostSchema.virtual("url").get(function () {
  return `/posts/${this._id}`;
});

// Method to check if a user has liked the post
PostSchema.methods.isLikedBy = function (userId) {
  return this.likes.some((like) => like.equals(userId));
};

// Pre-save hook to update the updatedAt field
PostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Post", PostSchema);
