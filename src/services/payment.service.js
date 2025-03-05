const { encrypt, decrypt } = require("../utils/ccavenue.util");
const ccavConfig = require("../config/ccavenue.config");
const Order = require("../models/Order.js");
const User = require("../models/user.js");
const Payment = require("../models/payment.js");

class PaymentService {
  async createCCavenuePaymentRequest(orderData) {
    console.log("Order Data", orderData);

    try {
      // Create order in database
      const user = await User.findOne({ clerkId: orderData.user });
      console.log("User", user);
      if (!user) {
        throw new Error("User not found");
      }
      const order = await Order.create({
        user: user._id,
        totalAmount: orderData.totalAmount,
        products: orderData.products,
        status: "PENDING",
      });

      // Create payment record
      const payment = await Payment.create({
        orderId: order._id.toString(),
        amount: order.totalAmount,
        paymentGateway: "ccavenue",
        status: "initiated",
        customerDetails: {
          name: orderData.name || "",
          email: orderData.email || "",
          phone: orderData.phone || "",
        },
      });

      // Link payment to order
      order.payment = payment._id;
      await order.save();

      // Prepare CCAvenue request parameters
      const merchantData = {
        merchant_id: ccavConfig.merchantId,
        order_id: order._id.toString(),
        currency: "INR",
        amount: order.totalAmount.toString(),
        redirect_url: ccavConfig.redirectUrl,
        cancel_url: ccavConfig.cancelUrl,
        language: "EN",
        billing_name: orderData.name || "",
        billing_address: orderData.address || "",
        billing_city: orderData.city || "",
        billing_state: orderData.state || "",
        billing_zip: orderData.zip || "",
        billing_country: orderData.country || "India",
        billing_tel: orderData.phone || "",
        billing_email: orderData.email || "",
      };

      // Convert to query string format
      const merchantParamString = Object.entries(merchantData)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      // Encrypt the data
      const encryptedData = encrypt(merchantParamString);

      // Return data needed for payment form
      return {
        paymentUrl: ccavConfig.paymentUrl,
        params: {
          encRequest: encryptedData,
          access_code: ccavConfig.accessCode,
        },
        orderId: order._id,
      };
    } catch (error) {
      console.error("Error creating payment request:", error);
      throw new Error("Failed to create payment request");
    }
  }

  async processCCavenueResponse(encResponse) {
    try {
      // Decrypt the response
      const decryptedResponse = decrypt(encResponse);

      // Parse response parameters
      const responseParams = {};
      decryptedResponse.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        responseParams[key] = value;
      });

      const { order_id, tracking_id, bank_ref_no, order_status } =
        responseParams;

      // Update order status in database
      const order = await Order.findById(order_id);
      if (!order) {
        throw new Error("Order not found");
      }

      order.paymentDetails = {
        trackingId: tracking_id,
        bankRefNo: bank_ref_no,
        status: order_status,
      };

      if (order_status === "Success") {
        order.status = "PAID";
      } else if (order_status === "Failure") {
        order.status = "FAILED";
      } else if (order_status === "Aborted") {
        order.status = "CANCELLED";
      } else {
        order.status = "PENDING";
      }

      await order.save();

      return {
        orderId: order_id,
        status: order_status,
        order,
      };
    } catch (error) {
      console.error("Error processing payment response:", error);
      throw new Error("Failed to process payment response");
    }
  }
}

module.exports = new PaymentService();
