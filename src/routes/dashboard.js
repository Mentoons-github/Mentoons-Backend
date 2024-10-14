const express = require("express");
const { getAnalytics } = require("../controllers/dashboard");
const router = express.Router();

router.get("/analytics", getAnalytics);

module.exports = router;
