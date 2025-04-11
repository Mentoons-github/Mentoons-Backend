const express = require("express");
const { getUserSession, availabiltyCheck } = require("../controllers/session");
const { conditionalAuth } = require("../middlewares/auth.middleware");

const sessionRoute = express.Router();

sessionRoute.use(conditionalAuth);

sessionRoute.get("/getbookings", getUserSession);
sessionRoute.get("/postpone", availabiltyCheck);

module.exports = sessionRoute;
