module.exports = {
  merchantId: process.env.CCAVENUE_MERCHANT_ID,
  accessCode: process.env.CCAVENUE_ACCESS_CODE,
  workingKey: process.env.CCAVENUE_WORKING_KEY,
  redirectUrl: "http://localhost:4000/api/v1/payment/ccavenue/callback",
  cancelUrl: "http://localhost:4000/api/v1/payment/ccavenue/cancel",
  paymentUrl:
    "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  apiVersion: "v1",
  environment: process.env.NODE_ENV || "development",
};
