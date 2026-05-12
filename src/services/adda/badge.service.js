const Badge = require("../../models/adda/badge");
const User = require("../../models/user");

const assignBadge = async (userId, badgeId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const badge = await Badge.findById(badgeId);
    if (!badge) throw new Error("Badge not found");

    const existing = user.badges.some(
      (b) => b.badge.toString() === badge._id.toString(),
    );

    if (existing) {
      return { success: false, message: "Badge already assigned" };
    }

    user.badges.push({ badge: badge._id });

    await user.save();

    return { success: true, message: "Badge assigned successfully" };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  assignBadge,
};
