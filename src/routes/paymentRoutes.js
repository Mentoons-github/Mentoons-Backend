const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController.js");
const ccavResponseHandler = require("../controllers/ccavResponseHandler.js");
const { requireAuth } = require("@clerk/express");

// Route to initiate payment
router.post(
  "/initiate",
  requireAuth({ signInUrl: "/sign-in" }),
  paymentController.initiatePayment
);

// Route to handle CCAvenue response
router.post("/ccavenue-response", ccavResponseHandler.postRes);

module.exports = router;
