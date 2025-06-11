const express = require("express");
const { getOrdersHistory, createReview } = require("../controllers/orders");
const verifyToken = require("../middlewares/addaMiddleware");

const orderRouter = express.Router();

orderRouter.get("/get-order-history", verifyToken, getOrdersHistory);
orderRouter.post("/write-review", verifyToken, createReview);

module.exports = orderRouter;
