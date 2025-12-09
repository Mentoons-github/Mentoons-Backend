const CandyCoins = require("../../../models/adda/game/candyCoins");

const updateUserCoins = async ({ userId, clerkId, amount, reason, type }) => {
  console.log("type got : ", type);
  const isSpend = type === "spend";

  let userCoins = await CandyCoins.findOne({ userId });

  if (!userCoins) {
    if (isSpend) throw new Error("Not enough coins to spend");

    userCoins = await CandyCoins.create({
      userId,
      clerkId,
      currentCoins: amount,
      totalEarned: amount,
      totalSpend: 0,
      history: [{ type, amount, reason, createdAt: new Date() }],
    });

    return userCoins;
  }

  if (isSpend && userCoins.currentCoins < amount) {
    throw new Error("Not enough coins to spend");
  }

  const coinChange = isSpend ? -amount : amount;

  const updatedCoins = await CandyCoins.findOneAndUpdate(
    { userId },
    {
      $inc: {
        currentCoins: coinChange,
        totalEarned: isSpend ? 0 : amount,
        totalSpend: isSpend ? amount : 0,
      },
      $push: {
        history: {
          type,
          amount,
          reason,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );

  return updatedCoins;
};

module.exports = updateUserCoins;
