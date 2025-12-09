const updateUserCoins = require("../../../helpers/adda/game/candyCoins");
const CandyCoins = require("../../../models/adda/game/candyCoins");
const asyncHandler = require("../../../utils/asyncHandler");

const updateCandyCoins = asyncHandler(async (req, res) => {
  const userId = req.user.dbUser._id;
  const clerkId = req.user.id;
  const { coins, reason } = req.body;
  const action = req.query.action;

  const updated = await updateUserCoins({
    userId,
    clerkId,
    amount: coins,
    reason,
    type: action,
  });

  return res.status(200).json({
    message: "Coin updated",
    currentCoins: updated.currentCoins,
  });
});

const getCandyCoins = asyncHandler(async (req, res) => {
  const userId = req.user.dbUser._id;

  const candyCoins = await CandyCoins.findOne({ userId });

  if (!candyCoins) {
    return res
      .status(200)
      .json({ currentCoins: 0, totalEarned: 0, totalSpent: 0 });
  }

  return res.status(200).json({
    message: "Candy coins found",
    candyCoins,
  });
});

const getCandyHistory = asyncHandler(async (req, res) => {
  const userId = req.user.dbUser._id;
  const coins = await CandyCoins.findOne({ userId });

  if (!coins) return res.status(200).json({ history: [] });

  return res.status(200).json({ history: coins.history.reverse() });
});

module.exports = {
  updateCandyCoins,
  getCandyCoins,
  getCandyHistory,
};
