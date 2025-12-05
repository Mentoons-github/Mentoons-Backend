const mongoose = require("mongoose");

const leaderBoardSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
    },
    playerId: {
      type: String,
      required: true,
      ref: "User",
    },
    userName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leaderboard", leaderBoardSchema);
