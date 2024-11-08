const User = require("../models/user");
const UserContributedPodcast = require("../models/userContributedPodcast");

const mongoose = require("mongoose");

module.exports = {
  addUserContributedPodcast: async (data,userId) => {
    const clerkId = userId
    try {
      const user = await User.find({ clerkId });

      if (!user) {
        throw new Error("User Not Register");
      }
      console.log(data,clerkId)
      const newPodcastContribution = new UserContributedPodcast({...data,clerkId});

      await newPodcastContribution.save();
      return newPodcastContribution;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  },
};
