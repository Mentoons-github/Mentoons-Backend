const mongoose = require("mongoose");
const UserContributedPodcastSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    audiofile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const UserContributedPodcast = mongoose.model(
  "UserContributedPodcast",
  UserContributedPodcastSchema
);

module.exports = UserContributedPodcast;
