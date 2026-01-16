const qs = require("qs");
const ccav = require("../../utils/ccavutil.js");

const getCcavenueParamString = (payment, planId, user, userPlanId) => {
  const redirect_cancel_url = `https://api.mentoons.com/api/v1/workshop/payment-response?userId=${encodeURIComponent(
    user.id
  )}`;

  const ccavenueParams = {
    merchant_id: process.env.CCAVENUE_MERCHANT_ID,
    order_id: payment.transactionId,
    currency: "INR",
    amount: payment.amount.toString(),
    redirect_url: redirect_cancel_url,
    cancel_url: redirect_cancel_url,
    language: "EN",
    billing_name: `${user.firstName} ${user.lastName || ""}`.trim(),
    billing_email: user.email,
    billing_tel: user.dbUser.phoneNumber || "",
    merchant_param1: user.dbUser._id.toString(),
    merchant_param2: planId,
    merchant_param3: userPlanId,
    merchant_param4: payment._id,
  };

  return Object.keys(ccavenueParams)
    .map((key) => `${key}=${encodeURIComponent(ccavenueParams[key])}`)
    .join("&");
};

const parseCcavenueResponse = (body, workingKey) => {
  let rawString = "";

  if (Buffer.isBuffer(body)) {
    rawString = body.toString();
  } else if (typeof body === "object") {
    rawString = qs.stringify(body);
  } else {
    rawString = body;
  }

  const parsedData = qs.parse(rawString);

  const ccavEncResponse = parsedData.encResp;
  if (!ccavEncResponse) throw new Error("Encrypted response not found");

  const decryptedResponse = ccav.decrypt(ccavEncResponse, workingKey);

  const responseObject = decryptedResponse.split("&").reduce((acc, pair) => {
    const [key, value] = pair.split("=");
    acc[key] = decodeURIComponent(value || "");
    return acc;
  }, {});

  return responseObject;
};

const mapEmiStatus = (orderStatus) => {
  switch (orderStatus?.toLowerCase()) {
    case "success":
      return { emiStatus: "active", accessStatus: "active" };

    case "pending":
      return { emiStatus: "active", accessStatus: "suspended" };

    case "aborted":
    case "failure":
      return { emiStatus: "defaulted", accessStatus: "suspended" };

    default:
      return { emiStatus: "defaulted", accessStatus: "suspended" };
  }
};

const getNextDueDate = () => {
  const today = new Date();
  const nextMonth = today.getMonth() + 1;
  const year = today.getFullYear();

  return new Date(year, nextMonth, 5);
};

module.exports = {
  getCcavenueParamString,
  parseCcavenueResponse,
  mapEmiStatus,
  getNextDueDate,
};
