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
const { parseCcavenueResponse } = require("../utils/workshop/emi.js");
const { paymentStatus } = require("./workshop/emi.js");

const postRes = async (request, response) => {
  const userId = request.query?.userId;

  const responseObject = parseCcavenueResponse(
    request.body,
    process.env.CCAVENUE_WORKING_KEY,
  );

  try {
    const subscriptionType = responseObject.merchant_param3 || null;
    const orderType = responseObject.order_type || "UNKNOWN";
    const quizType =
      responseObject.merchant_param1?.split(" (")[0].toLowerCase() || "";
    const difficulty = responseObject.merchant_param2?.split(",")[0] || "";

    let redirectUrl;

    const isWorkshop = responseObject.order_type === "WORKSHOP";

    if (isWorkshop) {
      return paymentStatus(request, response);
    }

    if (orderType === "QUIZ_PURCHASE") {
      redirectUrl = new URL(
        `${process.env.FRONTEND_URL}/quiz/${quizType}/${difficulty}`,
      );
    } else {
      redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
    }

    redirectUrl.searchParams.append(
      "status",
      responseObject.order_status || "UNKNOWN",
    );
    redirectUrl.searchParams.append("orderId", responseObject.order_id || "");
    redirectUrl.searchParams.append(
      "trackingId",
      responseObject.tracking_id || "",
    );

    if (subscriptionType) {
      redirectUrl.searchParams.append(
        "subscription",
        subscriptionType.toLowerCase(),
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
            { new: true },
          );
          await order.populate("user");

          if (responseObject.merchant_param4) {
            const psychologistId = new mongoose.Types.ObjectId(
              responseObject.merchant_param4,
            );
            await SessionModel.findOneAndUpdate(
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
              },
            );
          }

          if (order.order_type !== "consultancy_purchase") {
            await order.populate("items.product");
            await order.populate("products");
          }

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
              { new: true },
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
                const validUntil = new Date();
                validUntil.setFullYear(validUntil.getFullYear() + 1);

                await User.findOneAndUpdate(
                  { clerkId: userId },
                  {
                    "subscription.plan": subscriptionType.toLowerCase(),
                    "subscription.status": "active",
                    "subscription.startDate": new Date(),
                    "subscription.validUntil": validUntil,
                  },
                  { new: true },
                );

                const subscriptionData = {
                  plan: type,
                  status: "active",
                  startDate: new Date().toISOString(),
                  validUntil,
                };
                await clerk.users.updateUser(userId, {
                  publicMetadata: { subscriptionData },
                });

                await clerk.users.getUser(userId);
              }
              switch (order.order_type) {
                case "product_purchase":
                  const productMailInfo = {
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "Thank you for your purchase",
                    html: ProductEmailTemplate(order),
                  };
                  await sendEmail(productMailInfo);

                  break;
                case "subscription_purchase":
                  const subscriptionMailInfo = {
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "Thank you for purchasing Mentoons Subscription",
                    html: SubscriptionEmailTemplate(order),
                  };
                  const subscriptionEmailResponse =
                    await sendEmail(subscriptionMailInfo);
                  break;
                case "consultancy_purchase":
                  const consultancyMailInfo = {
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "🎉 You're In! Consultation Confirmed 🎉",
                    html: ConsultanyBookingemailTemplate(order),
                  };
                  const consultancyEmailResponse =
                    await sendEmail(consultancyMailInfo);
                  break;
                default:
                  break;
              }
            } catch (emailError) {
              console.error("Error Sending Email", emailError);
            }
          } else {
            console.log(
              "Unable to send email: Missing order details or user email",
            );
          }
        } catch (dbError) {
          console.error("Database update error:", dbError);
        }
      }
    }

    redirectUrl.searchParams.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    response.writeHeader(302, {
      Location: redirectUrl.toString(),
    });
    response.end();
  } catch (error) {
    // Redirect to frontend with error
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
    redirectUrl.searchParams.append("status", "ERROR");
    redirectUrl.searchParams.append(
      "message",
      "Failed to process payment response",
    );

    response.writeHeader(302, {
      Location: redirectUrl.toString(),
    });
    response.end();
  }
};

module.exports = { postRes };
