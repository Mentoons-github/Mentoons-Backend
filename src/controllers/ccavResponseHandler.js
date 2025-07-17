const http = require("http");
const fs = require("fs");
const ccav = require("../utils/ccavutil.js");
const qs = require("querystring");
const dotenv = require("dotenv");
const Order = require("../models/Order");
const User = require("../models/user.js");
const { clerk } = require("../middlewares/auth.middleware.js");
const mongoose = require("mongoose");

dotenv.config();

const {
  ProductEmailTemplate,
  SubscriptionEmailTemplate,
  ConsultanyBookingemailTemplate,
} = require("../utils/templates/email-template.js");
const { sendEmail } = require("../services/emailService.js");
const Employee = require("../models/employee.js");
const Cart = require("../models/cart.js");
const SessionModel = require("../models/session.js");

const postRes = async (request, response) => {
  console.log("Received CCAvenue response");
  const userId = request.query?.userId;

  console.log("userId got: ===========>", userId);

  let rawString = "";
  if (Buffer.isBuffer(request.body)) {
    rawString = request.body.toString();
  } else if (typeof request.body === "object") {
    rawString = qs.stringify(request.body);
  } else {
    rawString = request.body;
  }

  const parsedData = qs.parse(rawString);
  console.log("Parsed request data:", parsedData);

  const ccavEncResponse = parsedData.encResp,
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`;
  console.log("Starting CCAvenue response processing.");

  try {
    const decryptedResponse = ccav.decrypt(ccavEncResponse, workingKey);
    console.log("Decrypted Response:", decryptedResponse);

    const responseObject = decryptedResponse.split("&").reduce((acc, pair) => {
      const [key, value] = pair.split("=");
      acc[key] = decodeURIComponent(value || "");
      return acc;
    }, {});

    console.log("CCAvenue Response:", responseObject);
    const subscriptionType = responseObject.merchant_param3 || null;
    const orderType = responseObject.order_type || "UNKNOWN";
    const quizType =
      responseObject.merchant_param1?.split(" (")[0].toLowerCase() || "";
    const difficulty = responseObject.merchant_param2?.split(",")[0] || "";

    // Prepare redirect URL
    let redirectUrl;
    if (orderType === "QUIZ_PURCHASE") {
      // Redirect to the quiz page to continue where the user stopped
      redirectUrl = new URL(
        `${process.env.FRONTEND_URL}/quiz/${quizType}/${difficulty}`
      );
    } else {
      // Default redirect for other order types
      redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
    }

    redirectUrl.searchParams.append(
      "status",
      responseObject.order_status || "UNKNOWN"
    );
    redirectUrl.searchParams.append("orderId", responseObject.order_id || "");
    redirectUrl.searchParams.append(
      "trackingId",
      responseObject.tracking_id || ""
    );

    if (subscriptionType) {
      redirectUrl.searchParams.append(
        "subscription",
        subscriptionType.toLowerCase()
      );
    }

    // Set payment status message
    if (responseObject.order_status === "Success") {
      redirectUrl.searchParams.append("message", "Payment Successful");
    } else if (responseObject.order_status === "Aborted") {
      redirectUrl.searchParams.append("message", "Payment Aborted");
    } else if (responseObject.order_status === "Failure") {
      redirectUrl.searchParams.append("message", "Payment Failed");
    } else {
      redirectUrl.searchParams.append("message", "Payment Status Unknown");
    }

    // Handle QUIZ_PURCHASE specifically
    if (orderType === "QUIZ_PURCHASE") {
      console.log("Handling QUIZ_PURCHASE response");
      // Skip email sending and database operations for quiz purchases
      console.log(`Redirecting to quiz page: ${redirectUrl.toString()}`);
    } else {
      // Handle other order types (existing logic)
      if (responseObject.order_id) {
        try {
          const orderStatus =
            responseObject.order_status?.toUpperCase() || "UNKNOWN";
          const order = await Order.findOneAndUpdate(
            { orderId: responseObject.order_id },
            {
              status: orderStatus?.toUpperCase(),
              paymentId: responseObject.tracking_id || null,
              bankRefNumber: responseObject.bank_ref_no || null,
              paymentMethod: responseObject.payment_mode || null,
              updatedAt: new Date(),
              paymentResponse: JSON.stringify(responseObject),
            },
            { new: true }
          );
          await order.populate("user");

          if (responseObject.merchant_param4) {
            console.log("user id in order:", order.user._id);
            console.log("psychologistId:", responseObject.merchant_param4);
            console.log("userId:", order.user._id);

            const psychologistId = new mongoose.Types.ObjectId(
              responseObject.merchant_param4
            );
            const updatedSession = await SessionModel.findOneAndUpdate(
              {
                psychologistId: psychologistId,
                user: order.user._id,
                status: "pending",
              },
              {
                status: orderStatus.toLowerCase(),
              },
              {
                new: true,
              }
            );

            console.log("Updated Session:", updatedSession);
          }

          console.log("Order update result:", order);

          if (order.order_type !== "consultancy_purchase") {
            await order.populate("items.product");
            await order.populate("products");
          }
          console.log(
            `Order ${responseObject.order_id} updated with status: ${orderStatus}`
          );

          const type = subscriptionType?.toLowerCase() || "";

          if (
            order.order_type === "product_purchase" &&
            orderStatus.toUpperCase() === "SUCCESS"
          ) {
            const cart = await Cart.findOneAndUpdate(
              {
                userId: order.user._id,
                status: "completed",
              },
              { new: true }
            );
            console.log("Cart found and deleted:", cart);
            if (cart) {
              console.log("Cart deleted successfully");
            } else {
              console.log("No active cart found for user");
            }
          }

          if (
            order &&
            order.user &&
            order.user.email &&
            orderStatus.toUpperCase() === "SUCCESS"
          ) {
            try {
              if (type === "platinum" || type === "prime") {
                console.log(
                  "Membership subscription detected:",
                  subscriptionType
                );

                const validUntil = new Date();
                validUntil.setFullYear(validUntil.getFullYear() + 1);

                const updatedUser = await User.findOneAndUpdate(
                  { clerkId: userId },
                  {
                    "subscription.plan": subscriptionType.toLowerCase(),
                    "subscription.status": "active",
                    "subscription.startDate": new Date(),
                    "subscription.validUntil": validUntil,
                  },
                  { new: true }
                );

                console.log("User subscription updated:", updatedUser);

                const subscriptionData = {
                  plan: type,
                  status: "active",
                  startDate: new Date().toISOString(),
                  validUntil,
                };
                await clerk.users.updateUser(userId, {
                  publicMetadata: { subscriptionData },
                });

                const updatedUserInClerk = await clerk.users.getUser(userId);
                console.log(
                  "Updated Clerk User Metadata:",
                  updatedUserInClerk.publicMetadata
                );
              }
              switch (order.order_type) {
                case "product_purchase":
                  const productMailInfo = {
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "Thank you for your purchase",
                    html: ProductEmailTemplate(order),
                  };
                  const productEmailResponse = await sendEmail(productMailInfo);
                  console.log(
                    "email response ======================>",
                    productEmailResponse
                  );
                  if (productEmailResponse.success) {
                    console.log("EmailServiceResponse", productEmailResponse);
                    console.log(`Product access email sent to ${order.email}`);
                  }
                  break;
                case "subscription_purchase":
                  const subscriptionMailInfo = {
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "Thank you for purchasing Mentoons Subscription",
                    html: SubscriptionEmailTemplate(order),
                  };
                  const subscriptionEmailResponse = await sendEmail(
                    subscriptionMailInfo
                  );
                  if (subscriptionEmailResponse.success) {
                    console.log(
                      "Subscription email response ",
                      subscriptionEmailResponse
                    );
                  }
                  break;
                case "consultancy_purchase":
                  const consultancyMailInfo = {
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "🎉 You're In! Consultation Confirmed 🎉",
                    html: ConsultanyBookingemailTemplate(order),
                  };
                  const consultancyEmailResponse = await sendEmail(
                    consultancyMailInfo
                  );
                  if (consultancyEmailResponse.success) {
                    console.log(
                      "Consultancy email response",
                      consultancyEmailResponse
                    );
                  }
                  break;
                default:
                  break;
              }
            } catch (emailError) {
              console.error("Error Sending Email", emailError);
            }
          } else {
            console.log(
              "Unable to send email: Missing order details or user email"
            );
          }
        } catch (dbError) {
          console.error("Database update error:", dbError);
        }
      }
    }

    // Log the complete URL information
    console.log("Redirect URL object:", redirectUrl);
    console.log("Redirect URL string:", redirectUrl.toString());
    console.log("URL search parameters:");
    redirectUrl.searchParams.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    response.writeHeader(302, {
      Location: redirectUrl.toString(),
    });
    response.end();
  } catch (error) {
    console.error("CCAvenue response error:", error);

    // Redirect to frontend with error
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
    redirectUrl.searchParams.append("status", "ERROR");
    redirectUrl.searchParams.append(
      "message",
      "Failed to process payment response"
    );

    response.writeHeader(302, {
      Location: redirectUrl.toString(),
    });
    response.end();
  }
};

module.exports = { postRes };
