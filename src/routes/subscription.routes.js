const express = require("express");
const {createSubscription,getSubscriptions} = require("../controllers/subscription.controller")

const router = express.Router();

router.post("/subscribe", createSubscription);
router.get("/subscriptions", getSubscriptions);