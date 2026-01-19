const ccavRequestHandler = require("../ccavRequestHandler");
const Payment = require("../../models/workshop/payment");
const Plans = require("../../models/workshop/plan");
const UserPlan = require("../../models/workshop/userPlan");
const asyncHandler = require("../../utils/asyncHandler");
const { errorResponse } = require("../../utils/responseHelper");
const { v4: uuidv4 } = require("uuid");
const {
  parseCcavenueResponse,
  getCcavenueParamString,
  mapEmiStatus,
  getNextDueDate,
} = require("../../utils/workshop/emi");

//use conditional auth
const payFirstDownPayment = asyncHandler(async (req, res) => {
  console.log("=== payFirstDownPayment called ===");

  const {
    plan: planData,
    paymentType,
    mode,
    bplApplied,
    bplCardFile,
  } = req.body.paymentDetails;

  const user = req.user;

  if (!planData?.planId) {
    console.log("Missing planId");
    return errorResponse(res, 400, "Plan ID is required");
  }

  if (!paymentType || !["EMI", "FULL"].includes(paymentType)) {
    console.log("Invalid payment type:", paymentType);
    return errorResponse(res, 400, "Invalid payment type");
  }

  const plan = await Plans.findOne({ planId: planData.planId });

  if (!plan) {
    console.log("No plan found with planId:", planData.planId);
    return errorResponse(res, 404, "No plan found");
  }

  const existingPayment = await UserPlan.findOne({
    userId: user.dbUser._id,
    planId: plan._id,
    "emiDetails.status": { $in: ["active", "initiated"] },
  });
  console.log("Existing payment:", existingPayment);

  if (existingPayment) {
    console.log("User already has ongoing plan");
    return errorResponse(
      res,
      400,
      "You already have an ongoing plan. Please complete it before enrolling again."
    );
  }

  let userPlan;
  let paymentAmount;
  let paymentPurpose;

  try {
    if (paymentType === "EMI") {
      if (!plan.emi?.enabled) {
        return errorResponse(res, 400, "EMI is not available for this plan");
      }

      userPlan = await UserPlan.create({
        userId: user.dbUser._id,
        planId: plan._id,
        selectedMode: mode,
        paymentType: "EMI",
        totalAmount: plan.price.introductory,
        bplApplied: bplApplied || false,
        bplCardFile: bplCardFile || null,
        emiDetails: {
          status: "initiated",
          downPayment: plan.emi.downPayment,
          totalMonths: plan.emi.durationMonths,
          paidDownPayment: false,
          emiAmount: plan.emi.monthlyAmount,
          paidMonths: 0,
          nextDueDate: null,
        },
        accessStatus: "suspended",
      });

      paymentAmount = plan.emi.downPayment;
      paymentPurpose = "DOWN_PAYMENT";
    }

    if (paymentType === "FULL") {
      console.log("Creating FULL UserPlan");

      userPlan = await UserPlan.create({
        userId: user.dbUser._id,
        planId: plan._id,
        selectedMode,
        paymentType: "FULL",
        totalAmount: plan.price.introductory,
        bplApplied: bplApplied || false,
        bplCardFile: bplCardFile || null,
        accessStatus: "suspended",
      });

      console.log("FULL UserPlan created:", userPlan?._id);

      paymentAmount = plan.price.introductory;
      paymentPurpose = "FULL";
    }
  } catch (err) {
    console.error("Error creating UserPlan:", err);
    return errorResponse(res, 500, "Failed to create user plan");
  }

  if (!userPlan?._id) {
    console.log("userPlan is invalid after creation:", userPlan);
    return errorResponse(res, 500, "User plan creation returned invalid data");
  }

  let payment;
  try {
    console.log("Creating Payment record");

    payment = await Payment.create({
      amount: paymentAmount,
      gateway: "ccAvenue",
      paymentType: paymentPurpose,
      planId: plan._id,
      userId: user.dbUser._id,
      status: "PENDING",
      transactionId: uuidv4(),
      userPlanId: userPlan._id,
    });

    console.log("Payment created:", payment?._id);
  } catch (err) {
    console.error("Error creating Payment:", err);
    return errorResponse(res, 500, "Failed to create payment");
  }

  try {
    console.log("Generating CCAvenue param string");
    const paramString = getCcavenueParamString(
      payment,
      plan.planId,
      user,
      userPlan._id
    );

    req.ccavenueParams = paramString;
    console.log("CCAvenue param string generated successfully");

    ccavRequestHandler.postReq(req, res);
  } catch (err) {
    console.error("Error generating CCAvenue params:", err);
    return errorResponse(res, 500, "Failed to process payment gateway request");
  }
});

const payMonthlyEmi = asyncHandler(async (req, res) => {
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
    userPlan.planId,
    user,
    userPlan._id
  );

  console.log(paramString);

  req.ccavenueParams = paramString;
  ccavRequestHandler.postReq(req, res);
});

const paymentStatus = asyncHandler(async (req, res) => {
  console.log("===== CCAvenue Payment Status Callback START =====");

  const workingKey = process.env.CCAVENUE_WORKING_KEY;
  console.log("Working Key Loaded:", !!workingKey);

  console.log("Raw CCAvenue Body:", req.body);

  const responseObject = parseCcavenueResponse(req.body, workingKey);
  console.log("Parsed CCAvenue Response:", responseObject);

  const isSuccess = responseObject.order_status?.toLowerCase() === "success";
  console.log("Is Payment Success:", isSuccess);

  /* ------------------ Fetch Payment ------------------ */
  const paymentId = responseObject.merchant_param4;
  console.log("Fetching Payment ID:", paymentId);

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    console.log("❌ Payment not found:", paymentId);
    return errorResponse(res, 404, "No Payment found");
  }

  console.log("Payment Found:", {
    id: payment._id,
    status: payment.status,
    paymentType: payment.paymentType,
  });

  /* ------------------ Already Processed ------------------ */
  if (payment.status === "SUCCESS") {
    console.log("⚠️ Payment already marked SUCCESS, redirecting");
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment-status?status=SUCCESS`
    );
  }

  /* ------------------ Down Payment Failure ------------------ */
  if (payment.paymentType === "DOWN_PAYMENT" && !isSuccess) {
    console.log("❌ Down Payment FAILED");
    console.log("Rolling back Payment and UserPlan");

    await Payment.findByIdAndDelete(payment._id);
    console.log("Payment deleted:", payment._id);

    const userPlanId = responseObject.merchant_param3;
    await UserPlan.findByIdAndDelete(userPlanId);
    console.log("UserPlan deleted:", userPlanId);

    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
    redirectUrl.searchParams.append("status", responseObject.order_status);
    redirectUrl.searchParams.append("paymentType", payment.paymentType);

    console.log("Redirecting to:", redirectUrl.toString());
    return res.redirect(redirectUrl.toString());
  }

  /* ------------------ Fetch UserPlan ------------------ */
  console.log("Fetching UserPlan:", {
    userPlanId: responseObject.merchant_param3,
    userId: responseObject.merchant_param1,
  });

  let userPlan = await UserPlan.findOne({
    _id: responseObject.merchant_param3,
    userId: responseObject.merchant_param1,
  });

  if (!userPlan) {
    console.log("❌ UserPlan not found");
    return errorResponse(res, 404, "User plan not found");
  }

  console.log("UserPlan Found:", {
    id: userPlan._id,
    paymentType: userPlan.paymentType,
    emiDetails: userPlan.emiDetails,
  });

  /* ------------------ Down Payment Success ------------------ */
  if (payment.paymentType === "DOWN_PAYMENT" && isSuccess) {
    console.log("✅ Down Payment SUCCESS");

    const { emiStatus, accessStatus } = mapEmiStatus(
      responseObject.order_status
    );

    console.log("Mapped EMI Status:", { emiStatus, accessStatus });

    userPlan = await UserPlan.findByIdAndUpdate(
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

    console.log("UserPlan updated after DOWN_PAYMENT:", userPlan);
  }

  /* ------------------ EMI Payment Success ------------------ */
  if (payment.paymentType === "EMI" && isSuccess) {
    console.log("✅ EMI Payment SUCCESS");

    userPlan = await UserPlan.findByIdAndUpdate(
      userPlan._id,
      {
        $inc: {
          "emiDetails.paidMonths": 1,
        },
        $set: {
          "emiDetails.nextDueDate": getNextDueDate(),
          accessStatus: "active",
        },
      },
      { new: true }
    );

    console.log("UserPlan updated after EMI:", userPlan);
  }

  /* ------------------ Full Payment Success ------------------ */
  if (payment.paymentType === "FULL" && isSuccess) {
    console.log("✅ Full Payment SUCCESS");

    userPlan = await UserPlan.findByIdAndUpdate(
      userPlan._id,
      {
        $set: {
          accessStatus: "active",
        },
      },
      { new: true }
    );

    console.log("UserPlan updated after FULL_PAYMENT:", userPlan);
  }

  /* ------------------ EMI Completion Check ------------------ */
  if (
    userPlan.paymentType === "EMI" &&
    userPlan.emiDetails.paidMonths >= userPlan.emiDetails.totalMonths
  ) {
    console.log("🎉 EMI Completed");

    userPlan.emiDetails.status = "completed";
    userPlan.accessStatus = "expired";
    await userPlan.save();

    console.log("UserPlan marked as completed:", userPlan);
  }

  const finalPaymentStatus =
    responseObject.order_status?.toLowerCase() === "success"
      ? "SUCCESS"
      : responseObject.order_status?.toLowerCase() === "pending"
      ? "PENDING"
      : "ABORTED";

  
  await Payment.findByIdAndUpdate(payment._id, {
    $set: { status: finalPaymentStatus },
  });

  const redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
  redirectUrl.searchParams.append(
    "status",
    responseObject.order_status || "UNKNOWN"
  );
  redirectUrl.searchParams.append("paymentType", payment.paymentType);
  redirectUrl.searchParams.append("transactionId", payment.transactionId);

  return res.redirect(redirectUrl.toString());
});

const activeEmi = asyncHandler(async (req, res) => {
  console.log("===== Fetch Active EMI START =====");

  const userId = req.user.dbUser._id;
  console.log("User ID:", userId.toString());

  const today = new Date();
  console.log("Current Date:", today.toISOString());

  console.log("Query Conditions:");
  console.log({
    userId,
    "emiDetails.status": "active",
    "emiDetails.paidDownPayment": true,
    "emiDetails.paidMonths": "< totalMonths",
    "emiDetails.nextDueDate <= today": today,
  });

  const userEMI = await UserPlan.find({
    userId,
    "emiDetails.status": "active",
    "emiDetails.paidDownPayment": true,
    "emiDetails.nextDueDate": { $lte: today },
  });

  console.log("Raw EMI Records Found:", userEMI?.length || 0);

  if (!userEMI || userEMI.length === 0) {
    console.log("❌ No pending EMI found for user:", userId.toString());
    return errorResponse(res, 404, "No pending EMI left");
  }

  const pendingEmis = userEMI.filter(
    (plan) => plan.emiDetails.paidMonths < plan.emiDetails.totalMonths
  );

  console.log("Pending EMI After Month Check:", pendingEmis.length);

  pendingEmis.forEach((plan, index) => {
    console.log(`EMI #${index + 1}`, {
      userPlanId: plan._id,
      paidMonths: plan.emiDetails.paidMonths,
      totalMonths: plan.emiDetails.totalMonths,
      nextDueDate: plan.emiDetails.nextDueDate,
      amount: plan.emiDetails.monthlyAmount,
    });
  });

  console.log("===== Fetch Active EMI END =====");

  return successResponse(res, 200, pendingEmis);
});

const getEmiStatistics = asyncHandler(async (req, res) => {
  const userId = req.user.dbUser._id;
  console.log("Fetching EMI statistics for user:", userId);

  const activePlans = await UserPlan.find({
    userId,
    "emiDetails.status": "active",
    "emiDetails.paidDownPayment": true,
  });
  console.log("Active EMI plans found:", activePlans.length);

  if (!activePlans || activePlans.length === 0) {
    console.log("No active EMI plans found for this user.");
    return errorResponse(res, 404, "No active EMI plans found");
  }

  const plan = activePlans[0];
  console.log("Selected plan:", plan._id);

  const emiDetails = plan.emiDetails;
  console.log("EMI Details:", emiDetails);

  const totalEmiAmount = emiDetails.totalMonths * emiDetails.emiAmount;
  const paidAmount = emiDetails.paidMonths * emiDetails.emiAmount;
  const remainingAmount = totalEmiAmount - paidAmount;

  console.log("Calculated totalEmiAmount:", totalEmiAmount);
  console.log("Calculated paidAmount:", paidAmount);
  console.log("Calculated remainingAmount:", remainingAmount);

  const stats = {
    totalEmiAmount,
    paidAmount,
    remainingAmount,
    totalEmis: emiDetails.totalMonths,
    paidEmis: emiDetails.paidMonths,
    pendingEmis: emiDetails.totalMonths - emiDetails.paidMonths,
    nextDueDate: emiDetails.nextDueDate || null,
  };

  console.log("Final statistics to return:", stats);

  return successResponse(res, 200, stats);
});

module.exports = {
  payFirstDownPayment,
  paymentStatus,
  payMonthlyEmi,
  getEmiStatistics,
  activeEmi,
};
