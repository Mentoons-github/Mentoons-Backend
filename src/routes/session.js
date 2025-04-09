const express = require("express");
const { getUserSession } = require("../controllers/session");
const { conditionalAuth } = require("../middlewares/auth.middleware");

const sessionRoute = express.Router();

sessionRoute.get("/getbookings", conditionalAuth, getUserSession);

module.exports = sessionRoute;
