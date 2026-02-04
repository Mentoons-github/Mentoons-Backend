const Payment = require("../../models/workshop/payment");
const Plans = require("../../models/workshop/plan");
const UserPlan = require("../../models/workshop/userPlan");
const { mapEmiStatus, getNextDueDate } = require("../../utils/workshop/emi");
const assignBatchToUser = require("./batch.service");

const getPaymentOrThrow = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  return payment;
};

const handleEmiPayment = async (userPlan) => {
  const updatedPlan = await UserPlan.findByIdAndUpdate(
    userPlan._id,
    {
      $inc: { "emiDetails.paidMonths": 1 },
      $set: {
        "emiDetails.nextDueDate": getNextDueDate(),
        accessStatus: "active",
      },
    },
    { new: true },
  );

  if (updatedPlan.emiDetails.paidMonths >= updatedPlan.emiDetails.totalMonths) {
    updatedPlan.emiDetails.status = "completed";
    updatedPlan.accessStatus = "expired";
    await updatedPlan.save();
  }
};

const handleDownPaymentSuccess = async (userPlan, responseObject) => {
  const { emiStatus, accessStatus } = mapEmiStatus(responseObject.order_status);

  await UserPlan.findByIdAndUpdate(userPlan._id, {
    $set: {
      accessStatus,
      "emiDetails.status": emiStatus,
      "emiDetails.paidDownPayment": true,
      "emiDetails.nextDueDate": getNextDueDate(),
    },
  });

  const plan = await Plans.findOne({ planId: userPlan.planId });
  if (!plan) throw new Error("PLAN_NOT_FOUND");

  await assignBatchToUser(plan, userPlan.userId);
};

const handleFullPayment = async (userPlan) => {
  await UserPlan.findByIdAndUpdate(userPlan._id, {
    $set: { accessStatus: "active" },
  });
};

const handleDownPaymentFailure = async (paymentId, userPlanId) => {
  await Promise.all([
    Payment.findByIdAndDelete(paymentId),
    UserPlan.findByIdAndDelete(userPlanId),
  ]);
};

module.exports = {
  getPaymentOrThrow,
  handleDownPaymentSuccess,
  handleEmiPayment,
  handleFullPayment,
  handleDownPaymentFailure,
};
