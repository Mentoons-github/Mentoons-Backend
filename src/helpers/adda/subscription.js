const User = require("../../models/user");

const checkFriendRequestAccess = (user) => {
  const plan = user.subscription?.plan || "free";
  const limits = user.subscriptionLimits || {};
  const now = new Date();

  const currentFollowerCount = user.followers?.length || 0;
  const currentFollowingCount = user.following?.length || 0;
  const totalConnections = currentFollowerCount + currentFollowingCount;

  if (plan === "free") {
    const trialEnd = new Date(limits.freeTrialEndDate);
    const isTrialExpired = now > trialEnd;

    if (totalConnections >= 50) {
      return {
        allowed: false,
        upgradeRequired: true,
        upgradeTo: "prime",
        planType: "free",
        modalType: "friendLimitReached",
        message:
          "You’ve reached the 50 friend limit for the Free plan. Upgrade to Prime for more connections.",
      };
    }

    if (isTrialExpired) {
      return {
        allowed: true,
        planType: "free",
        trialExpired: true,
        message:
          "Your free trial has expired, but you can still connect with up to 50 friends.",
      };
    }

    return { allowed: true };
  }

  if (plan === "prime") {
    const freeFollowerCount = limits.freeFollowerCount || 0;
    const freeFollowingCount = limits.freeFollowingCount || 0;

    const primeOnlyConnections = Math.max(
      0,
      currentFollowerCount +
        currentFollowingCount -
        (freeFollowerCount + freeFollowingCount)
    );

    if (primeOnlyConnections >= 50) {
      return {
        allowed: false,
        upgradeRequired: true,
        upgradeTo: "platinum",
        planType: "prime",
        currentPrimeConnections: primeOnlyConnections,
        modalType: "primeToPlatinum",
        message:
          "You’ve reached the 50 connection limit of Prime membership. Upgrade to Platinum for unlimited connections.",
      };
    }

    return { allowed: true };
  }

  return { allowed: true };
};

const incrementFreeSubscriptionCounts = async (userId, type) => {
  const user = await User.findById(userId);
  if (user.subscription?.plan !== "free") return;

  const limits = user.subscriptionLimits || {};

  if (type === "follower") {
    limits.freeFollowersCount = (limits.freeFollowersCount || 0) + 1;
  } else if (type === "following") {
    limits.freeFollowingCount = (limits.freeFollowingCount || 0) + 1;
  }

  user.subscriptionLimits = limits;
  await user.save();
};
const decrementFreeSubscriptionCounts = async (userId, type) => {
  const user = await User.findById(userId);
  if (user.subscription?.plan !== "free") return;

  const limits = user.subscriptionLimits || {};

  if (type === "follower" && limits.freeFollowersCount > 0) {
    limits.freeFollowersCount -= 1;
  } else if (type === "following" && limits.freeFollowingCount > 0) {
    limits.freeFollowingCount -= 1;
  }

  user.subscriptionLimits = limits;
  await user.save();
};

module.exports = {
  checkFriendRequestAccess,
  incrementFreeSubscriptionCounts,
  decrementFreeSubscriptionCounts,
};
