var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
const Order = require("../models/Order");
dotenv.config();

const postRes = function (request, response) {
  console.log("Received CCAvenue response");
  var ccavEncResponse = "",
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`;

  request.on("data", function (data) {
    ccavEncResponse += data;
  });

  request.on("end", async function () {
    try {
      const ccavPOST = qs.parse(ccavEncResponse);
      const encryption = ccavPOST.encResp;
      const decryptedResponse = ccav.decrypt(encryption, workingKey);

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
