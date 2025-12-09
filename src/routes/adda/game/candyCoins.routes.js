const express = require("express");
const {
  updateCandyCoins,
  getCandyHistory,
  getCandyCoins,
} = require("../../../controllers/adda/game/candyCoins");
const { addaAuth } = require("../../../middlewares/adda/authMiddleware");

const router = express.Router();

router.use(addaAuth);
router.route("/candycoins").post(updateCandyCoins).get(getCandyCoins);
router.get("/history", getCandyHistory);

module.exports = router;
