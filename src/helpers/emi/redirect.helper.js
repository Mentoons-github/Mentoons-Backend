const Payment = require("../../models/workshop/payment")

const redirectToFrontend = (res, status, paymentType, transactionId) => {
  const redirectUrl = new URL(`${process.env.FRONTEND_URL}/payment-status`);
  redirectUrl.searchParams.append("status", status);
  if (paymentType) redirectUrl.searchParams.append("paymentType", paymentType);
  if (transactionId)
    redirectUrl.searchParams.append("transactionId", transactionId);
  return res.redirect(redirectUrl.toString());
};

const finalizePaymentStatus = async (payment, orderStatus) => {
  const finalStatus =
    orderStatus?.toLowerCase() === "success"
      ? "SUCCESS"
      : orderStatus?.toLowerCase() === "pending"
        ? "PENDING"
        : "ABORTED";

  await Payment.findByIdAndUpdate(payment._id, {
    $set: { status: finalStatus },
  });
};

module.exports = {
  redirectToFrontend,
  finalizePaymentStatus,
};
