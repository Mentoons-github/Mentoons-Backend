const crypto = require("crypto");
const config = require("../config/ccavenue.config");
const Payment = require("../models/payment");

function encrypt(plainText) {
  try {
    const m = crypto.createHash("md5");
    m.update(config.working_key);
    const key = m.digest();
    const iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (error) {
    logger.error("Encryption failed:", error);
    throw new Error("Payment encryption failed");
  }
}

function decrypt(encryptedText) {
  try {
    const m = crypto.createHash("md5");
    m.update(config.working_key);
    const key = m.digest();
    const iv = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f";
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    logger.error("Decryption failed:", error);
    throw new Error("Payment response decryption failed");
  }
}

async function initiatePayment(paymentData) {
  try {
    const payment = await Payment.create({
      orderId: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      customerDetails: {
        name: paymentData.customer_name,
        email: paymentData.customer_email,
        phone: paymentData.customer_phone,
      },
    });

    const merchantData = {
      merchant_id: config.merchant_id,
      order_id: payment.orderId,
      currency: payment.currency,
      amount: payment.amount,
      redirect_url: config.redirect_url,
      cancel_url: config.cancel_url,
      language: "EN",
      integration_type: "iframe_normal",
      customer_name: payment.customerDetails.name,
      customer_email: payment.customerDetails.email,
      customer_phone: payment.customerDetails.phone,
    };

    const encryptedData = encrypt(new URLSearchParams(merchantData).toString());
    

    return {
      payment_id: payment._id,
      encrypted_data: encryptedData,
      access_code: config.access_code,
      gateway_url: config.gateway_url,
    };
  } catch (error) {
    logger.error("Payment initiation failed:", error);
    throw new Error("Failed to initiate payment");
  }
}

async function handleResponse(encResp) {
  try {
    const decryptedData = decrypt(encResp);
    const responseParams = new URLSearchParams(decryptedData);
    const response = Object.fromEntries(responseParams);

    const payment = await Payment.findOne({ orderId: response.order_id });
    if (!payment) {
      throw new Error("Payment not found");
    }

    payment.status = response.order_status.toLowerCase();
    payment.trackingId = response.tracking_id;
    payment.bankRefNo = response.bank_ref_no;
    payment.paymentMode = response.payment_mode;
    payment.cardName = response.card_name;
    payment.statusMessage = response.status_message;
    payment.responseData = response;
    payment.attempts.push({
      timestamp: new Date(),
      status: response.order_status,
      response: response,
    });

    await payment.save();

    return {
      success: response.order_status === "Success",
      payment: payment,
    };
  } catch (error) {
    logger.error("Payment response handling failed:", error);
    throw new Error("Failed to process payment response");
  }
}

module.exports = {
  encrypt,
  decrypt,
  initiatePayment,
  handleResponse,
};
