const express = require("express");
const verifyToken = require("../../middlewares/addaMiddleware");
const {
  getOverallLeaderboard,
  createOrUpdateLeaderBoard,
} = require("../../controllers/adda/game");

const router = express.Router();

router.post("/score", verifyToken, createOrUpdateLeaderBoard);
router.get("/leaderboard", getOverallLeaderboard);

module.exports = router;
