const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const memeFeedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meme",
      },
    ],
    savedMemes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meme",
      },
    ],
    followingUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    preferences: {
      contentTypes: [
        {
          type: String,
        },
      ],
      prioritizeFollowing: {
        type: Boolean,
        default: true,
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination plugin
memeFeedSchema.plugin(mongoosePaginate);

// Method to add a meme to the feed
memeFeedSchema.methods.addMeme = async function (memeId) {
  if (!this.memes.includes(memeId)) {
    this.memes.push(memeId);
    this.lastUpdated = Date.now();
    await this.save();
  }
};

// Method to remove a meme from the feed
memeFeedSchema.methods.removeMeme = async function (memeId) {
  this.memes = this.memes.filter((id) => !id.equals(memeId));
  this.lastUpdated = Date.now();
  await this.save();
};

// Method to save a meme
memeFeedSchema.methods.saveMeme = async function (memeId) {
  if (!this.savedMemes.includes(memeId)) {
    this.savedMemes.push(memeId);
    this.lastUpdated = Date.now();
    await this.save();
  }
};

// Method to unsave a meme
memeFeedSchema.methods.unsaveMeme = async function (memeId) {
  this.savedMemes = this.savedMemes.filter((id) => !id.equals(memeId));
  this.lastUpdated = Date.now();
  await this.save();
};

// Method to follow a user
memeFeedSchema.methods.followUser = async function (userId) {
  if (!this.followingUsers.includes(userId)) {
    this.followingUsers.push(userId);
    this.lastUpdated = Date.now();
    await this.save();
  }
};

// Method to unfollow a user
memeFeedSchema.methods.unfollowUser = async function (userId) {
  this.followingUsers = this.followingUsers.filter((id) => !id.equals(userId));
  this.lastUpdated = Date.now();
  await this.save();
};

// Static method to add a new meme to relevant feeds
memeFeedSchema.statics.addMemeToFeeds = async function (memeId, memeUserId) {
  // Add to feeds of users who follow the meme creator
  const feeds = await this.find({
    followingUsers: memeUserId,
    "preferences.prioritizeFollowing": true,
  });

  for (const feed of feeds) {
    if (!feed.memes.includes(memeId)) {
      feed.memes.unshift(memeId); // Add to beginning of array
      feed.lastUpdated = Date.now();
      await feed.save();
    }
  }

  // Add to feeds of users who have matching content type preferences
  const meme = await mongoose.model("Meme").findById(memeId);
  if (meme && meme.tags && meme.tags.length > 0) {
    const matchingFeeds = await this.find({
      "preferences.contentTypes": { $in: meme.tags },
    });

    for (const feed of matchingFeeds) {
      if (!feed.memes.includes(memeId)) {
        feed.memes.push(memeId);
        feed.lastUpdated = Date.now();
        await feed.save();
      }
    }
  }
};

const MemeFeed = mongoose.model("MemeFeed", memeFeedSchema);

module.exports = MemeFeed;
