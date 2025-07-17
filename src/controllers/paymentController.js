const ccavRequestHandler = require("./ccavRequestHandler");
const Order = require("../models/Order");
const User = require("../models/user");
const Employee = require("../models/employee");
const SessionModel = require("../models/session");
const moment = require("moment");
const { findAvailablePsychologist } = require("./session");

const initiatePayment = async (req, res) => {
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

    // Validate required fields
    if (!amount || !productInfo || !email || !orderId) {
      return res.status(400).json({
        status: "error",
        message: "Missing required payment information",
      });
    }

    let productId = [];
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "User not authenticated",
      });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    let assignedPsychologistId = "";

    if (order_type === "consultancy_purchase") {
      // Handle consultancy purchase (unchanged)
      const consultancyItem = Array.isArray(items) ? items[0] : items;
      const sessionDate = new Date(consultancyItem.date);
      const sessionTime = consultancyItem.time;

      const availablePsychologist = await findAvailablePsychologist(
        consultancyItem.date,
        consultancyItem.time,
        consultancyItem.state
      );

      if (!availablePsychologist) {
        console.log("no psychologists found");
        return res.status(400).json({
          success: false,
          message:
            "All psychologists are fully booked at the selected date and time. Please choose another slot.",
        });
      }

      assignedPsychologistId = availablePsychologist._id.toString();

      const createdSession = await SessionModel.create({
        psychologistId: assignedPsychologistId,
        user: user._id,
        date: sessionDate,
        time: sessionTime,
        status: "pending",
        email,
        phone,
        name: req.body.customerName,
        description: consultancyItem?.description || "",
      });

      productId = [createdSession._id.toString()];
    } else if (order_type === "QUIZ_PURCHASE") {
      // For quiz purchases, use the product ID directly from items without database validation
      productId = Array.isArray(items)
        ? items.map((item) => item.product)
        : [items.product];
    } else {
      // For other order types, assume products are ObjectIds (unchanged)
      productId = Array.isArray(items)
        ? items.map((products) => products.product)
        : [items.product];
    }

    // For QUIZ_PURCHASE, skip database storage and proceed directly to CCAvenue
    let order;
    if (order_type !== "QUIZ_PURCHASE") {
      const orderData = {
        orderId,
        amount,
        productInfo,
        customerName: `${firstName} ${lastName || ""}`.trim() || user.name,
        email,
        user: user._id,
        products: productId,
        phone,
        order_type,
        status: "PENDING",
        createdAt: new Date(),
      };

      if (order_type !== "consultancy_purchase") {
        orderData.items = Array.isArray(items) ? items : [items];
      }

      order = await Order.findOneAndUpdate({ orderId }, orderData, {
        new: true,
        upsert: true,
      });
    }

    // Prepare CCAvenue parameters
    const redirect_cancel_url = `https://mentoons-backend-zlx3.onrender.com/api/v1/payment/ccavenue-response?userId=${encodeURIComponent(
      user.clerkId
    )}`;

    const ccavenueParams = {
      merchant_id: process.env.CCAVENUE_MERCHANT_ID,
      order_id: orderId,
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
        ? { merchant_param3: items[0].productName || "" }
        : typeof items === "object" && items !== null
        ? { merchant_param3: items.productName || "" }
        : {}),
      merchant_param4: assignedPsychologistId || "",
    };

    const paramString = Object.keys(ccavenueParams)
      .map((key) => `${key}=${encodeURIComponent(ccavenueParams[key])}`)
      .join("&");

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
