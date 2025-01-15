const CCavenueService = require("../services/ccavenue.service");
const Payment = require("../models/payment");
const logger = require("../utils/logger");

class PaymentController {
  // Initiate a new payment
  static async initiatePayment(req, res) {
    try {
      const paymentData = {
        order_id: `ORDER_${Date.now()}`,
        amount: req.body.amount,
        currency: req.body.currency || "INR",
        customer_name: req.body.customer_name,
        customer_email: req.body.customer_email,
        customer_phone: req.body.customer_phone,
      };

      const result = await CCavenueService.initiatePayment(paymentData);
      res.json(result);
    } catch (error) {
      logger.error("Payment initiation failed:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  }

  // Handle CCAvenue response
  static async handleResponse(req, res) {
    try {
      const { encResp } = req.body;
      const result = await CCavenueService.handleResponse(encResp);

      if (result.success) {
        res.redirect(`/payment/success/${result.payment.orderId}`);
      } else {
        res.redirect(`/payment/failure/${result.payment.orderId}`);
      }
    } catch (error) {
      logger.error("Payment response handling failed:", error);
      res.redirect("/payment/error");
    }
  }

  // Get payment status
  static async getPaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const payment = await Payment.findOne({ orderId });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      res.json({
        orderId: payment.orderId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        trackingId: payment.trackingId,
        updatedAt: payment.updatedAt,
      });
    } catch (error) {
      logger.error("Get payment status failed:", error);
      res.status(500).json({ error: "Failed to fetch payment status" });
    }
  }

  // Get payment history
  static async getPaymentHistory(req, res) {
    try {
      const payments = await Payment.find({
        "customerDetails.email": req.user.email,
      }).sort({ createdAt: -1 });

      res.json(payments);
    } catch (error) {
      logger.error("Get payment history failed:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  }

  // Retry failed payment
  static async retryPayment(req, res) {
    try {
      const { orderId } = req.params;
      const payment = await Payment.findOne({ orderId });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      if (payment.status === "success") {
        return res.status(400).json({ error: "Payment already successful" });
      }

      const result = await CCavenueService.initiatePayment({
        order_id: `${orderId}_retry_${Date.now()}`,
        amount: payment.amount,
        currency: payment.currency,
        customer_name: payment.customerDetails.name,
        customer_email: payment.customerDetails.email,
        customer_phone: payment.customerDetails.phone,
      });

      res.json(result);
    } catch (error) {
      logger.error("Payment retry failed:", error);
      res.status(500).json({ error: "Failed to retry payment" });
    }
  }
}

module.exports = PaymentController;
