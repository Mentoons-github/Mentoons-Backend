const User = require("../models/user");
const UserContributedPodcast = require("../models/userContributedPodcast");

const mongoose = require("mongoose");

module.exports = {
  addUserContributedPodcast: async (data) => {
    try {
      const user = await User.find({ clerkId: data.userId });

      if (!user) {
        throw new Error("User Not Register");
      }
      const newPodcastContribution = new UserContributedPodcast(data);

      await newPodcastContribution.save();
      return newPodcastContribution;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  },
};
