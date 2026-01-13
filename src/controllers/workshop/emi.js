const ccavRequestHandler = require("../ccavRequestHandler");
const Payment = require("../../models/workshop/payment");
const Plans = require("../../models/workshop/plan");
const UserPlan = require("../../models/workshop/userPlan");
const asyncHandler = require("../../utils/asyncHandler");
const { errorResponse } = require("../../utils/responseHelper");
const uuidv4 = require("uuid");
const {
  parseCcavenueResponse,
  getCcavenueParamString,
  mapEmiStatus,
  getNextDueDate,
} = require("../../utils/workshop/emi");

//use conditional auth
const payFirstDownPayment = asyncHandler(async (req, res) => {
  const planId = req.body;
  const user = req.user;

  const plan = await Plans.findOne({ planId });
  if (!plan) {
    return errorResponse(res, 404, "No plan found");
  }

  const existingPayment = await UserPlan.findOne({
    userId: user.dbUser._id,
    planId,
    "$emiDetails.status": "active",
  });
  if (existingPayment) {
    return errorResponse(
      res,
      400,
      "You still have an ongoing plan with pending EMIs. Please finish the current plan before enrolling in a new one."
    );
  }

  const userPlan = await UserPlan.create({
    userId: user.dbUser._id,
    planId,
    emiDetails: {
      status: "active",
      downPayment: plan.emi.downPayment,
      totalMonths: plan.emi.durationMonths,
      paidDownPayment: false,
      emiAmount: plan.emi.monthlyAmount,
      paidMonths: 0,
      nextDueDate: null,
    },
    paymentType: "EMI",
    totalAmount: plan.price.introductory,
    accessStatus: "suspended",
  });

  const payment = await Payment.create({
    amount: plan.emi.downPayment,
    gateway: "ccAvenue",
    paymentType: "DOWN_PAYMENT",
    planId,
    userId: user.dbUser._id,
    status: "PENDING",
    transactionId: uuidv4(),
    userPlanId: userPlan._id,
  });

  const paramString = getCcavenueParamString(
    payment,
    planId,
    user,
    userPlan._id
  );

  req.ccavenueParams = paramString;
  ccavRequestHandler.postReq(req, res);
});

const monthlyEmi = asyncHandler(async (req, res) => {
  const userPlanId = req.body;
  const user = req.user;

  const userPlan = await UserPlan.findById(userPlanId);
  if (!userPlan) {
    return errorResponse(res, 404, "No plan found");
  }

  if (!userPlan.emiDetails.paidDownPayment) {
    return errorResponse(res, 403, "Please pay down payment first");
  }

  if (userPlan.emiDetails.status != "active") {
    return errorResponse(res, 403, "The EMI is not active");
  }

  if (userPlan.emiDetails.paidMonths >= userPlan.emiDetails.totalMonths) {
    return errorResponse(res, 403, "You have already completed the EMI");
  }

  const payment = await Payment.create({
    amount: userPlan.emiDetails.emiAmount,
    gateway: "ccAvenue",
    paymentType: "EMI",
    planId: userPlan.planId,
    userId: user.dbUser._id,
    status: "PENDING",
    transactionId: uuidv4(),
    userPlanId: userPlan._id,
  });

  const paramString = getCcavenueParamString(
    payment,
    planId,
    user,
    userPlan._id
  );

  req.ccavenueParams = paramString;
  ccavRequestHandler.postReq(req, res);
});

const paymentStatus = asyncHandler(async (req, res) => {
  const workingKey = process.env.CCAVENUE_WORKING_KEY;

  const responseObject = parseCcavenueResponse(req.body, workingKey);
  const { emiStatus, accessStatus } = mapEmiStatus(responseObject.order_status);
  const userPlan = await UserPlan.findOneAndUpdate(
    {
      _id: responseObject.merchant_param3,
      userId: responseObject.merchant_param1,
    },
    {
      $set: {
        accessStatus,
        "emiDetails.paidDownPayment": true,
        "emiDetails.nextDueDate": getNextDueDate(),
        "emiDetails.status": emiStatus,
      },
    },
    { new: true }
  );

  if (!userPlan) {
    return errorResponse(res, 404, "User plan not found or update failed");
  }

  const paymentStatus =
    responseObject.order_status.toLowerCase() === "success"
      ? "SUCCESS"
      : responseObject.order_status.toLowerCase() === "PENDING"
      ? "PENDING"
      : "ABORTED";

  const paymentEdit = await Payment.findByIdAndUpdate(
    responseObject.merchant_param4,
    {
      $set: {
        status: paymentStatus,
      },
    }
  );

  if (!paymentEdit) {
    return errorResponse(
      res,
      304,
      "Payment record was not updated. No changes were made."
    );
  }

  const redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
  redirectUrl.searchParams.append(
    "status",
    responseObject.order_status || "UNKNOWN"
  );
  redirectUrl.searchParams("downPayment", "true");

  return res.redirectUrl(redirectUrl.toString());
});

module.exports = {
  payFirstDownPayment,
  paymentStatus,
  monthlyEmi,
};
