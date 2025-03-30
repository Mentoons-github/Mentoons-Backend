const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController.js");
const ccavResponseHandler = require("../controllers/ccavResponseHandler.js");

// Route to initiate payment
router.post("/initiate", paymentController.initiatePayment);

// Route to handle CCAvenue response
router.post(
  "/ccavenue-response",
  express.raw({ type: "*/*" }),
  ccavResponseHandler.postRes
);

module.exports = router;
