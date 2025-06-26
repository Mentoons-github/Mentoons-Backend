const express = require("express");
const { productAccessCheck } = require("../controllers/subscription");
const verifyToken = require("../middlewares/addaMiddleware");

const subscriptionRouter = express.Router();

subscriptionRouter.post("/access", verifyToken, productAccessCheck);

module.exports = subscriptionRouter;
