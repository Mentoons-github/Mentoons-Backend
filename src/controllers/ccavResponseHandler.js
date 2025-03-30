var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
const TemporaryUser = require("../models/tempUserPayment");
const Order = require("../models/Order");
const User = require("../models/user.js");
dotenv.config();

const postRes = async (request, response) => {
  console.log("Received CCAvenue response");
  const userId = req.query.userId;

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

    // Update order in database if order_id is present
    if (responseObject.order_id) {
      try {
        const orderStatus = responseObject.order_status || "Unknown";

        const orderUpdate = await Order.findByIdAndUpdate(
          { orderId: responseObject.order_id }, // responseObject.order_id,
          {
            status: orderStatus,
            paymentId: responseObject.tracking_id || null,
            bankRefNumber: responseObject.bank_ref_no || null,
            paymentMethod: responseObject.payment_mode || null,
            updatedAt: new Date(),
            paymentResponse: JSON.stringify(responseObject),
          }
        );

        console.log("Order update result:", orderUpdate);

        console.log(
          `Order ${responseObject.order_id} updated with status: ${orderStatus}`
        );
        if (subscriptionType === "Platinum" || subscriptionType === "Prime") {
          console.log("Membership subscription detected:", subscriptionType);

          const validUntil = new Date();
          validUntil.setFullYear(validUntil.getFullYear() + 1); // Set expiration to 1 year from now

          const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            {
              "subscription.plan": subscriptionType.toLowerCase(),
              "subscription.status": "active",
              "subscription.startDate": new Date(),
              "subscription.validUntil": validUntil,
            },
            { new: true }
          );

          console.log("User subscription updated:", updatedUser);
          console.log("Skipping product email since this is a subscription.");
        } else {
          console.log("here you can send the product to the user");
          const order = await Order.findById(responseObject.order_id).populate(
            "products"
          );
          if (order && order.user && order.user.email) {
            try {
              const emailData = {
                to: order.user.email,
                subject: "Your Mentoons Product Purchase",
                template: "product-purchase",
                context: {
                  orderId: order._id,
                  products: order.products.map((product) => ({
                    name: product.name,
                    downloadLink: product.downloadLink,
                  })),
                },
              };

              const emailServiceREsponse = await emailService.sendEmail(
                emailData
              );
              console.log("EmailServiceResponse", emailServiceREsponse);
              console.log(`Product access email sent to ${order.user.email}`);
            } catch (emailError) {
              console.error("Error sending product email:", emailError);
            }
          } else {
            console.log(
              "Unable to send email: Missing order details or user email"
            );
          }
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
