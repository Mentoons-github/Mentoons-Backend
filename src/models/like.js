const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const {
  ConversationContextImpl,
} = require("twilio/lib/rest/conversations/v1/conversation");

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



// Method to check if a like exists
LikeSchema.statics.findLike = function (userId, type, id) {
  console.log(userId, type, id);
  if (type === "post") return this.findOne({ user: userId, post: id });
  if (type === "meme") {
    console.log(this.findOne({ user: userId, meme: id }));
    return this.findOne({ user: userId, meme: id });
  }
  return null;
};

// Virtual for like URL
LikeSchema.virtual("url").get(function () {
  return `/likes/${this._id}`;
});

LikeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Like", LikeSchema);
