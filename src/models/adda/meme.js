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

// Pre-save hook to update the updatedAt field
MemeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

MemeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Meme", MemeSchema);
