var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
const TemporaryUser = require("../models/tempUserPayment");
const Order = require("../models/Order");
const User = require("../models/user.js");
dotenv.config();

const postRes = function (request, response) {
  console.log("Received CCAvenue response");

  if (request.body) {
    // Log the Buffer and its string representation
    console.log("Raw request body as Buffer:", request.body);
    const rawBodyString = request.body.toString();
    console.log("Raw request body as string:", rawBodyString);

    // If the data is in query string format, parse it:
    const parsedData = qs.parse(rawBodyString);
    console.log("Parsed request data:", parsedData);
  } else {
    console.log("No request body received.");
  }

  var ccavEncResponse = "",
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`;
  console.log("Starting CCAvenue response processing.");
  console.log("Using Working Key:", workingKey);

  request.on("error", (err) => {
    console.error("Request stream error:", err);
  });

  console.log("response checking");
  request.on("data", function (data) {
    console.log("Received data chunk:", data.toString());
    ccavEncResponse += data;
  });

  console.log("going to next one");
  request.on("end", async function () {
    try {
      const ccavPOST = qs.parse(ccavEncResponse);
      const encryption = ccavPOST.encResp;
      const decryptedResponse = ccav.decrypt(encryption, workingKey);

      console.log("request obeject checking");
      // Convert the response string to an object
      const responseObject = decryptedResponse
        .split("&")
        .reduce((acc, pair) => {
          const [key, value] = pair.split("=");
          acc[key] = decodeURIComponent(value || "");
          return acc;
        }, {});

      console.log("CCAvenue Response:", responseObject);

      // Update order in database if order_id is present
      if (responseObject.order_id) {
        try {
          const storedUser = await TemporaryUser.findOne({
            orderId: responseObject.order_id,
          });

          console.log(
            "Checking stored user for orderId:",
            responseObject.order_id
          );
          console.log("Stored user data:", storedUser);

          if (!storedUser) {
            console.log(
              "User authentication expired or missing for orderId:",
              responseObject.order_id
            );
            return response
              .status(401)
              .json({ error: "User authentication expired or missing" });
          }

          const user = await User.findOne({ clerkId: storedUser.userId });
          console.log(
            "Checking user in database with clerkId:",
            storedUser.userId
          );
          console.log("User data found:", user);

          if (!user) {
            console.log(
              "User does not exist in system for clerkId:",
              storedUser.userId
            );
            return response
              .status(403)
              .json({ error: "User does not exist in our system" });
          }

          console.log(
            "Deleting stored temporary user record for orderId:",
            responseObject.order_id
          );
          await TemporaryUser.deleteOne({ orderId: responseObject.order_id });
          console.log("Temporary user record deleted successfully.");

          const orderStatus = responseObject.order_status || "Unknown";

          const orderUpdate = await Order.findByIdAndUpdate(
            responseObject.order_id,
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

          console.log("here you can send the product to the user");
          // Send email to user with product link
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
  });
};

module.exports = { postRes };
