const crypto = require("crypto");
const ccavRequestHandler = require("./ccavRequestHandler");
const Order = require("../models/Order");
const User = require("../models/user");
const Employee = require("../models/employee");
const SessionModel = require("../models/session");
const { Combo } = require("../models/combo"); // NEW: check this path matches your project
const moment = require("moment");
const { findAvailablePsychologist } = require("./session");
const {
  isPsychologistAvailable,
} = require("../utils/session/sessionAvailability");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_GIFT_MESSAGE = 200;

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
      isGift,
      giftDetails,
    } = req.body;

    const platform = req.body.platform === "mobile" ? "mobile" : "web";

    if (!amount || !productInfo || !email || !orderId) {
      return res.status(400).json({
        status: "error",
        message: "Missing required payment information",
      });
    }

    const giftEnabled = isGift === true;

    if (giftEnabled) {
      const recipientEmail = String(giftDetails?.recipientEmail || "").trim();
      const senderName = String(giftDetails?.senderName || "").trim();

      if (order_type !== "product_purchase") {
        return res.status(400).json({
          status: "error",
          message: "Gifting is only available for product purchases",
        });
      }
      if (!EMAIL_REGEX.test(recipientEmail)) {
        return res.status(400).json({
          status: "error",
          message: "A valid recipient email is required",
        });
      }
      if (!senderName) {
        return res.status(400).json({
          status: "error",
          message: "Sender name is required",
        });
      }
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

    /* ---------------- NEW: COMBO HANDLING ---------------- */
    const itemList = Array.isArray(items) ? items : items ? [items] : [];
    const hasCombo = itemList.some((i) => i?.productType === "combo");
    const comboBundleIds = {}; // comboId -> [productIds]

    if (hasCombo) {
      let serverSubtotal = 0;

      for (const item of itemList) {
        if (item?.productType === "combo") {
          const combo = await Combo.findById(item.product).lean();
          if (!combo) {
            return res.status(400).json({
              status: "error",
              message: "Combo not found",
            });
          }
          if (Number(item.price) !== combo.price) {
            return res.status(400).json({
              status: "error",
              message: "Combo price has changed. Please reload and try again.",
            });
          }
          comboBundleIds[String(combo._id)] = (combo.details?.bundleItems || [])
            .map((b) => b.product)
            .filter(Boolean)
            .map(String);
        }
        serverSubtotal += Number(item?.price || 0) * (item?.quantity || 1);
      }

      if (Number(amount) > serverSubtotal) {
        return res.status(400).json({
          status: "error",
          message: "Invalid amount",
        });
      }
    }
    /* ------------------------------------------------------ */

    let assignedPsychologistId = "";

    if (order_type === "consultancy_purchase") {
      const consultancyItem = Array.isArray(items) ? items[0] : items;
      const sessionDate = new Date(consultancyItem.date);
      const sessionTime = consultancyItem.time;
      const sessionDuration = consultancyItem.duration || "1 Hour";

      let availablePsychologist = null;

      if (consultancyItem.psychologistId) {
        const stillAvailable = await isPsychologistAvailable({
          psychologistId: consultancyItem.psychologistId,
          date: consultancyItem.date,
          time: sessionTime,
          duration: sessionDuration,
        });

        if (stillAvailable) {
          availablePsychologist = await Employee.findById(
            consultancyItem.psychologistId,
          );
        }
      } else {
        availablePsychologist = await findAvailablePsychologist(
          consultancyItem.date,
          consultancyItem.time,
          consultancyItem.state,
        );
      }

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
        duration: sessionDuration,
        state: consultancyItem.state,
      });

      productId = [createdSession._id.toString()];
    } else if (order_type === "QUIZ_PURCHASE") {
      productId = Array.isArray(items)
        ? items.map((item) => item.product)
        : [items.product];
    } else {
      productId = Array.isArray(items)
        ? items.map((products) => products.product)
        : [items.product];
    }

    // NEW: replace each combo id with the ids of the products inside it
    const orderProductIds = [
      ...new Set(productId.flatMap((id) => comboBundleIds[String(id)] || [id])),
    ];

    let order;
    if (order_type !== "QUIZ_PURCHASE") {
      const orderData = {
        orderId,
        amount,
        productInfo,
        customerName: `${firstName} ${lastName || ""}`.trim() || user.name,
        email,
        user: user._id,
        products: orderProductIds, // CHANGED: was `productId`
        phone,
        order_type,
        status: "PENDING",
        createdAt: new Date(),
        platform,
      };

      if (order_type !== "consultancy_purchase") {
        orderData.items = Array.isArray(items) ? items : [items];
      }

      if (giftEnabled) {
        orderData.isGift = true;
        orderData.giftDetails = {
          recipientEmail: String(giftDetails.recipientEmail)
            .trim()
            .toLowerCase(),
          senderName: String(giftDetails.senderName).trim(),
          message: String(giftDetails.message || "")
            .trim()
            .slice(0, MAX_GIFT_MESSAGE),
          claimToken: crypto.randomBytes(24).toString("hex"),
          claimed: false,
        };
      }

      order = await Order.findOneAndUpdate({ orderId }, orderData, {
        new: true,
        upsert: true,
      });
    }

    const redirect_cancel_url = `https://api.mentoons.com/api/v1/payment/ccavenue-response?userId=${encodeURIComponent(
      user.clerkId,
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
      merchant_param2: productId.join(","), // unchanged: keeps the short original ids
      ...(Array.isArray(items) && items.length > 0
        ? { merchant_param3: items[0].productName || "" }
        : typeof items === "object" && items !== null
          ? { merchant_param3: items.productName || "" }
          : {}),
      merchant_param4: assignedPsychologistId || "",
      merchant_param5: platform,
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
