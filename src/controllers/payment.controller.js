const paymentService = require("../services/payment.service");
const Payment = require("../models/payment");
const logger = require("../utils/logger");
const Order = require("../models/Order");

const initiatePayment = async (req, res) => {
  console.log("payment.controller.js - initiatePayment");
  try {
    const orderData = req.body;
    const paymentRequest = await paymentService.createCCavenuePaymentRequest(
      orderData
    );

    return res.status(200).json({
      success: true,
      data: paymentRequest,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: error.message,
    });
  }
};

const handlePaymentCallback = async (req, res) => {
  try {
    const { encResp } = req.body;
    if (!encResp) {
      return res.status(400).json({
        success: false,
        message: "Invalid response from payment gateway",
      });
    }

    const paymentResponse = await paymentService.processCCavenueResponse(
      encResp
    );

    // Redirect based on payment status
    if (paymentResponse.status === "Success") {
      return res.redirect(
        `/payment/success?orderId=${paymentResponse.orderId}`
      );
    } else if (paymentResponse.status === "Failure") {
      return res.redirect(
        `/payment/failure?orderId=${paymentResponse.orderId}`
      );
    } else {
      return res.redirect(
        `/payment/pending?orderId=${paymentResponse.orderId}`
      );
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return res.redirect("/payment/error");
  }
};

const handlePaymentCancel = async (req, res) => {
  return res.redirect("/payment/cancelled");
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        paymentDetails: order.paymentDetails,
      },
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error.message,
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      "customerDetails.email": req.user.email,
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    logger.error("Get payment history failed:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// Retry failed payment
const retryPayment = async (req, res) => {
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
};

module.exports = {
  initiatePayment,
  handlePaymentCallback,
  handlePaymentCancel,
  getPaymentStatus,
  getPaymentHistory,
  retryPayment,
};
