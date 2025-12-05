const Leaderboard = require("../../models/adda/game");
const User = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");

const createOrUpdateLeaderBoard = asyncHandler(async (req, res) => {
  const { gameId, score, difficulty } = req.body;
  const playerId = req.user;

  if (!playerId) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  const player = await User.findById(playerId);

  if (!player) {
    return res.status(404).json({ message: "User not found" });
  }

  const userName = player.name;
  const profilePic = player.picture;

  if (!gameId || score == null) {
    return res.status(400).json({ message: "Game ID and score required" });
  }

  const existing = await Leaderboard.findOne({ gameId, playerId, difficulty });

  if (!existing) {
    const newRecord = await Leaderboard.create({
      gameId,
      playerId,
      userName,
      profilePic,
      score,
      difficulty,
    });

    return res.status(201).json({
      message: "Score added",
      data: newRecord,
    });
  }

  if (score > existing.score) {
    existing.score = score;
    existing.userName = userName;
    existing.profilePic = profilePic;
    await existing.save();

    return res.status(200).json({
      message: "Score updated",
      data: existing,
    });
  }

  return res.status(200).json({
    message: "No update — lower score",
    data: existing,
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
