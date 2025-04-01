const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController.js");
const ccavResponseHandler = require("../controllers/ccavResponseHandler.js");
const { requireAuth } = require("@clerk/express");
const conditionalAuth = require("../middlewares/auth.middleware.js");

// Route to initiate payment
router.post("/initiate", conditionalAuth, paymentController.initiatePayment);

// Route to handle CCAvenue response
router.post("/ccavenue-response", ccavResponseHandler.postRes);

module.exports = router;
