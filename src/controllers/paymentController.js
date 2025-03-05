const ccavRequestHandler = require("./ccavRequestHandler");
const Order = require("../models/Order");
const User = require("../models/user");

const initiatePayment = async (req, res) => {
  try {
    const { amount, productInfo, email, phone, orderId, firstName, lastName } = req.body;

    console.log("Order Data", req.body);

    if (!amount || !productInfo || !email || !phone || !orderId) {
      return res.status(400).json({
        status: "error",
        message: "Missing required payment information",
      });
    }

    // Create or update order record in database
    const order = await Order.findOneAndUpdate(
      { orderId: orderId },
      {
        orderId,
        amount,
        productInfo,
        customerName: "Test User",
        email,
        phone,
        status: "PENDING",
        createdAt: new Date(),
      },
      { new: true, upsert: true }
    );

    const ccavenueParams = {
      merchant_id: process.env.CCAVENUE_MERCHANT_ID,
      order_id: order.orderId,
      currency: "INR",
      currency: "INR",
      amount: amount.toString(),
      redirect_url: `${process.env.FRONTEND_URL}/payment-status`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-status`,
      language: "EN",
      billing_name: `${firstName} ${lastName || ""}`.trim(),
      billing_email: email,
      billing_tel: phone,
      merchant_param1: productInfo,
    };

    // Convert params object to query string
    const paramString = Object.keys(ccavenueParams)
      .map((key) => `${key}=${encodeURIComponent(ccavenueParams[key])}`)
      .join("&");

    // Set the prepared data in request and call CCAvenue handler
    req.ccavenueParams = paramString;
    ccavRequestHandler.postReq(req, res);
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to initiate payment",
      error: error.message,
    });
  }
};

module.exports = { initiatePayment };
