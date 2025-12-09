const express = require("express");
const verifyToken = require("../../middlewares/addaMiddleware");
const {
  getOverallLeaderboard,
  createOrUpdateLeaderBoard,
} = require("../../controllers/adda/game");
const CandyCoinsRoutes = require("../../routes/adda/game/candyCoins.routes");

const router = express.Router();

router.post("/score", verifyToken, createOrUpdateLeaderBoard);
router.get("/leaderboard", getOverallLeaderboard);
router.use("/coins", CandyCoinsRoutes);

module.exports = router;
