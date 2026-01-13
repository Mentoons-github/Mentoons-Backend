const updateUserCoins = require("../../helpers/adda/game/candyCoins");
const Leaderboard = require("../../models/adda/game");
const User = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");

const createOrUpdateLeaderBoard = asyncHandler(async (req, res) => {
  const { gameId, score, difficulty, success } = req.body;
  const playerId = req.user;

  const player = await User.findById(playerId);
  let rewardPoints = 0;
  const existing = await Leaderboard.findOne({ gameId, playerId, difficulty });

  if (!existing) {
    const newRecord = await Leaderboard.create({
      gameId,
      playerId,
      userName: player.name,
      profilePic: player.picture,
      score,
      difficulty,
    });

    if (success) {
      const updatedCoins = await updateUserCoins({
        userId: player._id,
        clerkId: player.clerkId,
        amount: 1000,
        reason: `${gameId} level completed`,
        type: "earn",
      });

      rewardPoints = updatedCoins.currentCoins;
    }

    return res.status(201).json({
      message: "Score added",
      data: newRecord,
      rewardPoints: success ? rewardPoints : 0,
    });
  }

  console.log(existing,'exxxissss')

  if (score > existing.score) {
    existing.score = score;
    await existing.save();
  }

  if (success) {
    const updatedCoins = await updateUserCoins({
      userId: player._id,
      clerkId: player.clerkId,
      amount: 1000,
      reason: `${gameId} level completed`,
      type: "earn",
    });

    rewardPoints = updatedCoins.currentCoins;
  }

  return res.status(200).json({
    message: "Score updated",
    data: existing,
    rewardPoints: success ? rewardPoints : 0,
  });
});

const getOverallLeaderboard = asyncHandler(async (req, res) => {
  const results = await Leaderboard.aggregate([
    {
      $group: {
        _id: "$playerId",
        userName: { $first: "$userName" },
        totalScore: { $sum: "$score" },
        clerkId: { $first: "$clerkId" },
      },
    },
    {
      $addFields: { userIdObj: { $toObjectId: "$_id" } },
    },
    {
      $lookup: {
        from: "users",
        localField: "userIdObj",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $sort: { totalScore: -1 } },
  ]);

  const final = results.map((entry, index) => ({
    rank: index + 1,
    playerId: entry._id,
    playerClerkId: entry.user?.clerkId || null,
    userName: entry.userName || entry.user?.fullName,
    totalScore: entry.totalScore,
    profileImage: entry.user?.picture || null,
  }));

  res.status(200).json({
    success: true,
    count: final.length,
    data: final,
  });
});

module.exports = { createOrUpdateLeaderBoard, getOverallLeaderboard };
