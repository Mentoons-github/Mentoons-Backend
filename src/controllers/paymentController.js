const ccavRequestHandler = require("./ccavRequestHandler");
const TemporaryUser = require("../models/tempUserPayment");
const Order = require("../models/Order");

const initiatePayment = async (req, res) => {
  console.log("paymentController.js - initiatePayment");
  try {
    const {
      amount,
      productInfo,
      email,
      items,
      phone,
      orderId,
      order_type,
      firstName,
      lastName,
    } = req.body;

    // const order_type =
    //   type === "subscription"
    //     ? "subscription_purchase"
    //     : type === "assessment"
    //     ? "assessment_purchase"
    //     : type === "download"
    //     ? "product_purchase"
    //     : "consultancy_purchase";

    if (!amount || !productInfo || !email || !orderId) {
      return res.status(400).json({
        status: "error",
        message: "Missing required payment information",
      });
    }

    const productId =
      order_type === "subscription_purchase"
        ? [items?.name || "subscription"]
        : Array.isArray(items)
        ? items.map((products) => products.product)
        : [items.product];

    const userId = req.user?.id;

    console.log(
      "userId in initiate payment =========================>",
      userId
    );

    // Create or update order record in database
    const order = await Order.findOneAndUpdate(
      { orderId: orderId },
      {
        orderId,
        amount,
        productInfo,
        customerName: `${firstName} ${lastName || ""}`.trim(),
        email,
        items: Array.isArray(items) ? items : [items],
        products: productId,
        phone,
        order_type,
        status: "PENDING",
        createdAt: new Date(),
      },
      { new: true, upsert: true }
    );

    console.log("orderRecieved =========================> ", order);
    const redirect_cancel_url = `https://mentoons-backend-zlx3.onrender.com/api/v1/payment/ccavenue-response?userId=${encodeURIComponent(
      userId
    )}`;

    const ccavenueParams = {
      merchant_id: process.env.CCAVENUE_MERCHANT_ID,
      order_id: order.orderId,
      currency: "INR",
      amount: amount.toString(),
      redirect_url: redirect_cancel_url,
      cancel_url: redirect_cancel_url,
      language: "EN",
      billing_name: `${firstName} ${lastName || ""}`.trim(),
      billing_email: email,
      billing_tel: phone,

      merchant_param1: productInfo,
      merchant_param2: productId.join(","),
      ...(Array.isArray(items) && items.length > 0
        ? { merchant_param3: items[0].name || "" }
        : typeof items === "object" && items !== null
        ? { merchant_param3: items.name || "" }
        : {}),
    };

    if (Array.isArray(items) && items.length > 0) {
      console.log("Passing merchant_param3 as first item name:", items[0].name);
    } else if (typeof items === "object" && items !== null) {
      console.log("Passing merchant_param3 as object name:", items.name);
    }

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
