const ccavRequestHandler = require("../ccavRequestHandler");
const Payment = require("../../models/workshop/payment");
const Plans = require("../../models/workshop/plan");
const UserPlan = require("../../models/workshop/userPlan");
const asyncHandler = require("../../utils/asyncHandler");
const {
  errorResponse,
  successResponse,
} = require("../../utils/responseHelper");

const { v4: uuidv4 } = require("uuid");
const {
  getCcavenueParamString,
  mapEmiStatus,
  getNextDueDate,
} = require("../../utils/workshop/emi");

const createInitialPayment = asyncHandler(async (req, res) => {
  console.log("=== payFirstDownPayment called ===");

  const {
    plan: planData,
    paymentType,
    mode,
    bplApplied,
    bplCardFile,
  } = req.body.paymentDetails;
  const user = req.user;

  if (!planData?.planId) return errorResponse(res, 400, "Plan ID is required");
  if (!["EMI", "FULL"].includes(paymentType))
    return errorResponse(res, 400, "Invalid payment type");

  const plan = await Plans.findOne({ planId: planData.planId });
  if (!plan) return errorResponse(res, 404, "No plan found");

  const existingPlan = await UserPlan.findOne({
    userId: user.dbUser._id,
    planId: plan._id,
  });

  let userPlan;
  let paymentAmount;
  let paymentPurpose;

  const isEMI = paymentType === "EMI";

  if (existingPlan) {
    if (existingPlan.paymentType === "EMI") {
      const status = existingPlan.emiDetails?.status;

      if (status === "initiated") {
        userPlan = existingPlan;
        paymentAmount = existingPlan.emiDetails.downPayment;
        paymentPurpose = "DOWN_PAYMENT";
      } else if (["active", "suspended"].includes(status)) {
        return errorResponse(
          res,
          400,
          "You already have an ongoing EMI plan. Please complete it first.",
        );
      }
    } else if (existingPlan.paymentType === "FULL") {
      if (existingPlan.accessStatus === "initiated") {
        userPlan = existingPlan;
        paymentAmount = existingPlan.totalAmount;
        paymentPurpose = "FULL";
      } else if (existingPlan.accessStatus === "active") {
        return errorResponse(
          res,
          400,
          "You already have an active full payment plan.",
        );
      } else if (existingPlan.accessStatus === "suspended") {
        return errorResponse(
          res,
          400,
          "Your plan is suspended. Contact support.",
        );
      }
    }
  }

  if (!userPlan) {
    try {
      if (isEMI) {
        if (!plan.emi?.enabled)
          return errorResponse(res, 400, "EMI not available");

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
          accessStatus: "initiated",
        });

        paymentAmount = plan.emi.downPayment;
        paymentPurpose = "DOWN_PAYMENT";
      } else {
        userPlan = await UserPlan.create({
          userId: user.dbUser._id,
          planId: plan._id,
          selectedMode: mode,
          paymentType: "FULL",
          totalAmount: plan.price.introductory,
          bplApplied: bplApplied || false,
          bplCardFile: bplCardFile || null,
          accessStatus: "initiated",
        });

        paymentAmount = plan.price.introductory;
        paymentPurpose = "FULL";
      }

      console.log(`${paymentType} UserPlan created:`, userPlan._id);
    } catch (err) {
      console.error("Error creating UserPlan:", err);
      return errorResponse(res, 500, "Failed to create user plan");
    }
  }

  if (!userPlan?._id)
    return errorResponse(res, 500, "User plan creation returned invalid data");

  let payment;
  try {
    payment = await Payment.findOne({
      userPlanId: userPlan._id,
      status: "PENDING",
      paymentType: paymentPurpose,
    });

    if (!payment) {
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
      console.log("Payment created:", payment._id);
    } else {
      console.log("Pending payment exists:", payment._id);
    }
  } catch (err) {
    console.error("Error creating payment:", err);
    return errorResponse(res, 500, "Failed to create payment");
  }

  try {
    const paramString = getCcavenueParamString(
      payment,
      plan.planId,
      user,
      userPlan._id,
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
  const { userPlanId } = req.body;
  console.log(userPlanId);
  const user = req.user;

  const userPlan = await UserPlan.findById(userPlanId);
  if (!userPlan) {
    return errorResponse(res, 404, "No plan found");
  }

  if (!userPlan.emiDetails.paidDownPayment) {
    return errorResponse(res, 400, "Please pay down payment first");
  }

  if (userPlan.emiDetails.status != "active") {
    return errorResponse(res, 403, "The EMI is not active");
  }

  if (userPlan.emiDetails.paidMonths >= userPlan.emiDetails.totalMonths) {
    return errorResponse(res, 403, "You have already completed the EMI");
  }

  let payment;

  payment = await Payment.findOne({
    userPlanId: userPlan._id,
    status: "PENDING",
    paymentType: "EMI",
  });

  if (!payment) {
    console.log("creating a new payment");

    payment = await Payment.create({
      amount: userPlan.emiDetails.emiAmount,
      gateway: "ccAvenue",
      paymentType: "EMI",
      planId: userPlan.planId,
      userId: user.dbUser._id,
      status: "PENDING",
      transactionId: uuidv4(),
      userPlanId: userPlan._id,
    });

    console.log("payment created");
  }

  console.log("using the existing payment");

  const paramString = getCcavenueParamString(
    payment,
    userPlan.planId,
    user,
    userPlan._id,
  );

  console.log(paramString);

  req.ccavenueParams = paramString;
  ccavRequestHandler.postReq(req, res);
});

const paymentStatus = asyncHandler(async (req, res, responseObject) => {
  console.log("===== CCAvenue Payment Status Callback START =====");

  const workingKey = process.env.CCAVENUE_WORKING_KEY;
  console.log("Working Key Loaded:", !!workingKey);

  console.log("Raw CCAvenue Body:", req.body);

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
      `${process.env.FRONTEND_URL}/payment-status?status=SUCCESS`,
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
      responseObject.order_status,
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
      { new: true },
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
      { new: true },
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
      { new: true },
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
    responseObject.order_status || "UNKNOWN",
  );
  redirectUrl.searchParams.append("paymentType", payment.paymentType);
  redirectUrl.searchParams.append("transactionId", payment.transactionId);

  return res.redirect(redirectUrl.toString());
});

const activeEmi = asyncHandler(async (req, res) => {
  console.log("===== Fetch Active EMI START =====");

  const userId = req.user.dbUser._id;
  console.log("User ID:", userId.toString());

  // End of today (to include overdue + today)
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  console.log("End Of Today:", endOfToday.toISOString());

  // Find EMI which is due today OR overdue
  const userEMI = await UserPlan.find({
    userId,
    "emiDetails.status": "active",
    "emiDetails.paidDownPayment": true,
    "emiDetails.nextDueDate": { $lte: endOfToday },
    $expr: {
      $lt: ["$emiDetails.paidMonths", "$emiDetails.totalMonths"],
    },
  });

  console.log("Raw EMI Records Found:", userEMI.length);

  if (!userEMI || userEMI.length === 0) {
    console.log("❌ No pending EMI found");
    return errorResponse(res, 404, "No pending EMI");
  }

  // Map only required data for frontend
  const pendingEmis = userEMI.map((plan) => ({
    userPlanId: plan._id,
    planId: plan.planId,
    paidMonths: plan.emiDetails.paidMonths,
    totalMonths: plan.emiDetails.totalMonths,
    monthlyAmount: plan.emiDetails.emiAmount,
    nextDueDate: plan.emiDetails.nextDueDate,
    isOverdue: plan.emiDetails.nextDueDate < new Date(),
  }));

  console.log("===== Fetch Active EMI END =====");

  return successResponse(res, 200, "Pending EMI found", pendingEmis);
});

const getEmiStatistics = asyncHandler(async (req, res) => {
  const userId = req.user.dbUser._id;

  const activePlans = await UserPlan.find({
    userId,
    "emiDetails.status": "active",
    "emiDetails.paidDownPayment": true,
  });

  if (!activePlans || activePlans.length === 0) {
    return errorResponse(res, 404, "No active EMI plans found");
  }

  const plan = activePlans[0];
  const emiDetails = plan.emiDetails;

  const totalEmiAmount = emiDetails.totalMonths * emiDetails.emiAmount;
  const paidAmount = emiDetails.paidMonths * emiDetails.emiAmount;
  const remainingAmount = totalEmiAmount - paidAmount;

  const stats = {
    totalEmiAmount,
    paidAmount,
    remainingAmount,
    totalEmis: emiDetails.totalMonths,
    paidEmis: emiDetails.paidMonths,
    pendingEmis: emiDetails.totalMonths - emiDetails.paidMonths,
    nextDueDate: emiDetails.nextDueDate || null,
  };

  return successResponse(res, 200, "Stats fetched successfully", stats);
});

const completedPayment = asyncHandler(async (req, res) => {
  console.log("===== Fetch Completed Payments START =====");

  const userId = req.user.dbUser._id;
  console.log("User ID:", userId.toString());

  const payments = await Payment.find({
    userId,
    status: "SUCCESS",
  })
    .populate("planId", "planName price")
    .populate("userPlanId", "paymentType emiDetails accessStatus")
    .sort({ createdAt: -1 });

  if (!payments || payments.length === 0) {
    console.log("❌ No completed payments found");
    return errorResponse(res, 404, "No completed payments found");
  }

  const formattedPayments = payments.map((payment) => {
    const userPlan = payment.userPlanId;

    return {
      paymentId: payment._id,
      transactionId: payment.transactionId,
      paymentType: payment.paymentType,
      amount: payment.amount,
      planId: payment.planId?._id,
      planName: payment.planId?.planName,
      paymentStatus: payment.status,
      paidAt: payment.createdAt,

      emiDetails:
        userPlan?.paymentType === "EMI"
          ? {
              totalMonths: userPlan.emiDetails.totalMonths,
              paidMonths: userPlan.emiDetails.paidMonths,
              emiAmount: userPlan.emiDetails.emiAmount,
              nextDueDate: userPlan.emiDetails.nextDueDate,
              emiStatus: userPlan.emiDetails.status,
            }
          : null,
    };
  });

  console.log(`✅ Completed Payments Found: ${formattedPayments.length}`);

  console.log("===== Fetch Completed Payments END =====");

  return successResponse(
    res,
    200,
    "Completed payments fetched successfully",
    formattedPayments,
  );
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const invoice = await Payment.findOne({ transactionId }).populate(
    "userPlanId",
  );
  if (!invoice) {
    return errorResponse(res, 404, "No invoice found");
  }
  return successResponse(res, 200, "Invoice details fetched", invoice);
});

module.exports = {
  createInitialPayment,
  paymentStatus,
  downloadInvoice,
  payMonthlyEmi,
  getEmiStatistics,
  activeEmi,
  completedPayment,
};
