const {
  getCombos,
  getComboByKey,
  upsertCombo,
} = require("../controllers/combo");
const verifyToken = require("../middlewares/addaMiddleware");
const express = require("express");

const router = express.Router();

router.get("/", getCombos);
router.get("/combos/:key", getComboByKey);
router.put("/combos/:key", verifyToken, upsertCombo);

module.exports = router;
