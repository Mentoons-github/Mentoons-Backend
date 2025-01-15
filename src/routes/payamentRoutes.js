const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");
// const { validatePaymentRequest } = require("../middleware/validation");
const rateLimiter = require("../middleware/rateLimiter");
const auth = require("../middleware/auth");

// Public routes (no authentication required)
router.post(
  "/initiate",
  validatePaymentRequest,
  PaymentController.initiatePayment
);

router.post("/response", PaymentController.handleResponse);

// router.post("/verify", rateLimiter, PaymentController.verifyPayment);

// Protected routes (require authentication)
router.get("/status/:orderId", PaymentController.getPaymentStatus); // auth required

router.get("/history", PaymentController.getPaymentHistory); // auth required

router.post("/retry/:orderId", auth, PaymentController.retryPayment);// auth required

// Webhook route for CCAvenue notifications
// router.post("/webhook", PaymentController.handleWebhook);

module.exports = router;


// Route usage examples:
/*
POST /api/payments/initiate - Start new payment
POST /api/payments/response - Handle CCAvenue response
POST /api/payments/verify - Verify payment status
GET  /api/payments/status/:orderId - Check payment status
GET  /api/payments/history - Get payment history
POST /api/payments/retry/:orderId - Retry failed payment
POST /api/payments/webhook - Handle CCAvenue notifications
*/
