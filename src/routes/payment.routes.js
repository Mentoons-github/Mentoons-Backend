const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymenontroller.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");

// Initiate payment
router.post("/initiate", paymentController.initiatePayment);

// Payment callbacks from CCAvenue
router.post("/ccavenue/callback", paymentController.handlePaymentCallback);
router.post("/ccavenue/cancel", paymentController.handlePaymentCancel);

// Get payment status
router.get(
  "/status/:orderId",

  paymentController.getPaymentStatus
);

module.exports = router;
