const http = require("http");
const fs = require("fs");
const ccav = require("../utils/ccavutil.js");
const qs = require("querystring");
const dotenv = require("dotenv");
const Order = require("../models/Order");
const User = require("../models/user.js");
const { clerk } = require("../middlewares/auth.middleware.js");
const mongoose = require("mongoose");

const Payment = require("../models/workshop/payment");
const UserPlan = require("../models/workshop/userPlan");

const { mapEmiStatus, getNextDueDate } = require("../utils/workshop/emi");

const {
  ProductEmailTemplate,
  SubscriptionEmailTemplate,
  ConsultanyBookingemailTemplate,
} = require("../utils/templates/email-template.js");
const { sendEmail } = require("../services/emailService.js");
const Employee = require("../models/employee.js");
const Cart = require("../models/cart.js");
const SessionModel = require("../models/session.js");

dotenv.config();

const postRes = async (request, response) => {
  const userId = request.query?.userId;

  let rawString = "";
  if (Buffer.isBuffer(request.body)) {
    rawString = request.body.toString();
  } else if (typeof request.body === "object") {
    rawString = qs.stringify(request.body);
  } else {
    rawString = request.body;
  }

  const parsedData = qs.parse(rawString);
  console.log("Parsed CCAvenue callback data:", parsedData);

  const ccavEncResponse = parsedData.encResp;
  const workingKey = process.env.CCAVENUE_WORKING_KEY;

  console.log("Starting CCAvenue response processing...");

  try {
    const decryptedResponse = ccav.decrypt(ccavEncResponse, workingKey);
    console.log("Decrypted Response:", decryptedResponse);

    const responseObject = decryptedResponse.split("&").reduce((acc, pair) => {
      const [key, value] = pair.split("=");
      acc[key] = decodeURIComponent(value || "");
      return acc;
    }, {});

    console.log("Full CCAvenue Response:", responseObject);

    const order_status =
      responseObject.order_status?.toLowerCase() || "unknown";
    const isSuccess = order_status === "success";

    // Prepare base redirect URL
    let redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);

    redirectUrl.searchParams.append(
      "status",
      responseObject.order_status || "UNKNOWN"
    );
    redirectUrl.searchParams.append("orderId", responseObject.order_id || "");
    redirectUrl.searchParams.append(
      "trackingId",
      responseObject.tracking_id || ""
    );

    // ────────────────────────────────────────────────────────────────
    // IMPROVED DETECTION: Use explicit merchant_param5 flag
    // ────────────────────────────────────────────────────────────────
    const isWorkshopPayment =
      (responseObject.merchant_param5 || "").toUpperCase() === "WORKSHOP";

    if (isWorkshopPayment) {
      console.log(
        "=== WORKSHOP / EMI / PLAN PAYMENT DETECTED (merchant_param5=WORKSHOP) ==="
      );

      const paymentId = responseObject.merchant_param4;
      const userPlanId = responseObject.merchant_param3;

      // 1. Find Payment document
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        console.log("Payment record not found:", paymentId);
        redirectUrl.searchParams.append("message", "Payment record not found");
        response.writeHead(302, { Location: redirectUrl.toString() });
        return response.end();
      }

      // Idempotency check
      if (payment.status === "SUCCESS") {
        console.log("Payment already processed successfully - skipping");
        response.writeHead(302, { Location: redirectUrl.toString() });
        return response.end();
      }

      // 2. Find associated UserPlan
      const userPlan = await UserPlan.findOne({
        _id: userPlanId,
        userId: responseObject.merchant_param1,
      });

      if (!userPlan) {
        console.log("UserPlan not found:", userPlanId);
        redirectUrl.searchParams.append("message", "User plan not found");
        response.writeHead(302, { Location: redirectUrl.toString() });
        return response.end();
      }

      // DOWN PAYMENT FAILURE → rollback
      if (payment.paymentType === "DOWN_PAYMENT" && !isSuccess) {
        console.log("DOWN PAYMENT FAILED → rolling back");
        await Payment.findByIdAndDelete(payment._id);
        await UserPlan.findByIdAndDelete(userPlanId);

        redirectUrl.searchParams.append("paymentType", "DOWN_PAYMENT");
        response.writeHead(302, { Location: redirectUrl.toString() });
        return response.end();
      }

      // DOWN PAYMENT SUCCESS
      if (payment.paymentType === "DOWN_PAYMENT" && isSuccess) {
        console.log("DOWN PAYMENT SUCCESS");
        const { emiStatus, accessStatus } = mapEmiStatus(
          responseObject.order_status
        );

        await UserPlan.findByIdAndUpdate(
          userPlan._id,
          {
            $set: {
              accessStatus,
              "emiDetails.status": emiStatus,
              "emiDetails.paidDownPayment": true,
              "emiDetails.nextDueDate": getNextDueDate(),
            },
          },
          { new: true }
        );
      }

      // MONTHLY EMI SUCCESS
      if (payment.paymentType === "EMI" && isSuccess) {
        console.log("MONTHLY EMI SUCCESS");
        const updated = await UserPlan.findByIdAndUpdate(
          userPlan._id,
          {
            $inc: { "emiDetails.paidMonths": 1 },
            $set: {
              "emiDetails.nextDueDate": getNextDueDate(),
              accessStatus: "active",
            },
          },
          { new: true }
        );

        if (updated.emiDetails.paidMonths >= updated.emiDetails.totalMonths) {
          console.log("EMI FULLY COMPLETED");
          await UserPlan.findByIdAndUpdate(updated._id, {
            $set: {
              "emiDetails.status": "completed",
              accessStatus: "expired",
            },
          });
        }
      }

      // FULL PAYMENT SUCCESS
      if (payment.paymentType === "FULL" && isSuccess) {
        console.log("FULL PAYMENT SUCCESS");
        await UserPlan.findByIdAndUpdate(
          userPlan._id,
          {
            $set: { accessStatus: "active" },
          },
          { new: true }
        );
      }

      // Final payment status update
      const finalStatus = isSuccess
        ? "SUCCESS"
        : order_status === "pending"
        ? "PENDING"
        : "ABORTED";

      await Payment.findByIdAndUpdate(payment._id, {
        $set: { status: finalStatus },
      });

      redirectUrl.searchParams.append("paymentType", payment.paymentType);
      redirectUrl.searchParams.append("transactionId", payment.transactionId);
    } else {
      // ────────────────────────────────────────────────────────────────
      // REGULAR FLOWS: Product / Subscription / Consultancy / Quiz
      // ────────────────────────────────────────────────────────────────
      console.log("Processing as regular order (non-workshop)");

      const subscriptionType = responseObject.merchant_param3 || null;
      const orderType = responseObject.order_type || "UNKNOWN";
      const quizType =
        responseObject.merchant_param1?.split(" (")[0].toLowerCase() || "";
      const difficulty = responseObject.merchant_param2?.split(",")[0] || "";

      if (orderType === "QUIZ_PURCHASE") {
        redirectUrl = new URL(
          `${process.env.FRONTEND_URL}/quiz/${quizType}/${difficulty}`
        );
      }

      const statusMessages = {
        success: "Payment Successful",
        aborted: "Payment Aborted",
        failure: "Payment Failed",
      };
      redirectUrl.searchParams.append(
        "message",
        statusMessages[order_status] || "Payment Status Unknown"
      );

      if (subscriptionType) {
        redirectUrl.searchParams.append(
          "subscription",
          subscriptionType.toLowerCase()
        );
      }

      if (orderType !== "QUIZ_PURCHASE" && responseObject.order_id) {
        const orderStatus =
          responseObject.order_status?.toUpperCase() || "UNKNOWN";

        const order = await Order.findOneAndUpdate(
          { orderId: responseObject.order_id },
          {
            status: orderStatus,
            paymentId: responseObject.tracking_id || null,
            bankRefNumber: responseObject.bank_ref_no || null,
            paymentMethod: responseObject.payment_mode || null,
            updatedAt: new Date(),
            paymentResponse: JSON.stringify(responseObject),
          },
          { new: true }
        );

        if (order) {
          await order.populate("user");

          if (responseObject.merchant_param4) {
            const psychologistId = new mongoose.Types.ObjectId(
              responseObject.merchant_param4
            );
            await SessionModel.findOneAndUpdate(
              {
                psychologistId,
                user: order.user._id,
                status: "pending",
              },
              { status: orderStatus.toLowerCase() },
              { new: true }
            );
          }

          if (order.order_type !== "consultancy_purchase") {
            await order.populate("items.product");
            await order.populate("products");
          }

          if (
            order.order_type === "product_purchase" &&
            orderStatus === "SUCCESS"
          ) {
            await Cart.findOneAndUpdate(
              { userId: order.user._id, status: "completed" },
              { new: true }
            );
          }

          if (order.user?.email && orderStatus === "SUCCESS") {
            const type = subscriptionType?.toLowerCase() || "";

            try {
              switch (order.order_type) {
                case "product_purchase":
                  await sendEmail({
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "Thank you for your purchase",
                    html: ProductEmailTemplate(order),
                  });
                  break;

                case "subscription_purchase":
                  await sendEmail({
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "Thank you for purchasing Mentoons Subscription",
                    html: SubscriptionEmailTemplate(order),
                  });

                  if (type === "platinum" || type === "prime") {
                    const validUntil = new Date();
                    validUntil.setFullYear(validUntil.getFullYear() + 1);

                    await User.findOneAndUpdate(
                      { clerkId: userId },
                      {
                        "subscription.plan": type,
                        "subscription.status": "active",
                        "subscription.startDate": new Date(),
                        "subscription.validUntil": validUntil,
                      },
                      { new: true }
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
                  }
                  break;

                case "consultancy_purchase":
                  await sendEmail({
                    from: process.env.EMAIL_USER,
                    to: order.email,
                    subject: "🎉 You're In! Consultation Confirmed 🎉",
                    html: ConsultanyBookingemailTemplate(order),
                  });
                  break;
              }
            } catch (emailError) {
              console.error("Email sending error:", emailError);
            }
          }
        }
      }
    }

    console.log("Final redirect:", redirectUrl.toString());
    response.writeHead(302, { Location: redirectUrl.toString() });
    response.end();
  } catch (error) {
    console.error("CCAvenue callback error:", error);

    const errorRedirect = new URL(`${process.env.FRONTEND_URL}/payment-status`);
    errorRedirect.searchParams.append("status", "ERROR");
    errorRedirect.searchParams.append(
      "message",
      "Failed to process payment response"
    );

    response.writeHead(302, { Location: errorRedirect.toString() });
    response.end();
  }
};

module.exports = { postRes };
