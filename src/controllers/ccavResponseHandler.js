var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
const Order = require("../models/Order");
const User = require("../models/user.js");
const { clerk } = require("../middlewares/auth.middleware.js");

dotenv.config();

const {
  ProductEmailTemplate,
  SubscriptionEmailTemplate,
  // AssessementReportEmailTemplate,
  ConsultanyBookingemailTemplate,
} = require("../utils/templates/email-template.js");

const { sendEmail } = require("../services/emailService.js");
const Employee = require("../models/employee.js");

const postRes = async (request, response) => {
  console.log("Received CCAvenue response");
  const userId = request.query?.userId;

  console.log("userId got : ===========>", userId);

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

  var ccavEncResponse = parsedData.encResp,
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`;
  console.log("Starting CCAvenue response processing.");

  console.log("going to next one");
  try {
    const decryptedResponse = ccav.decrypt(ccavEncResponse, workingKey);
    console.log("Decrypted Response:", decryptedResponse);

    // Convert the response string to an object
    const responseObject = decryptedResponse.split("&").reduce((acc, pair) => {
      const [key, value] = pair.split("=");
      acc[key] = decodeURIComponent(value || "");
      return acc;
    }, {});

    console.log("CCAvenue Response:", responseObject);
    const subscriptionType = responseObject.merchant_param3 || null;

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

        console.log("Order update result:", order);

        if (order.order_type !== "consultancy_purchase") {
          await order.populate("items.product");
          await order.populate("products");
        }
        await order.populate("user");
        console.log(
          `Order ${responseObject.order_id} updated with status: ${orderStatus}`
        );

        const type = subscriptionType?.toLowerCase() || "";

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
                publicMetadata: {
                  subscriptionData,
                },
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
                  subject: "Thank for your purchase",
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
                const { items, user } = order;
                const sessionItem = items[0];

                const psychologist = await Employee.findOne({
                  role: "psychologist",
                });

                const sessionData = new SessionModel({
                  userId: user._id,
                  pyschologistId: psychologist._id,
                  date: sessionItem.date,
                  time: sessionItem.time,
                  status: "Booked",
                  orderId: order._id,
                  notes: sessionItem.description || "No description provided",
                });

                await sessionData.save();
                console.log("Consultancy session saved:", sessionData);

                const consultancyMialinfo = {
                  from: process.env.EMAIL_USER,
                  to: order.email,
                  subject: "🎉 You're In! Consultation Confirmed 🎉",
                  html: ConsultanyBookingemailTemplate(order),
                };
                const consultancyEmailResponse = await sendEmail(
                  consultancyMialinfo
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
            console.error(`Error Sending Email`, emailError);
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

    // Redirect to frontend with payment status
    const redirectUrl = new URL(process.env.FRONTEND_URL + "/payment-status");
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

    if (responseObject.order_status === "Success") {
      redirectUrl.searchParams.append("message", "Payment Successful");
    } else if (responseObject.order_status === "Aborted") {
      redirectUrl.searchParams.append("message", "Payment Aborted");
    } else if (responseObject.order_status === "Failure") {
      redirectUrl.searchParams.append("message", "Payment Failed");
    } else {
      redirectUrl.searchParams.append("message", "Payment Status Unknown");
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
    const redirectUrl = new URL(process.env.FRONTEND_URL + "/payment-status");
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
