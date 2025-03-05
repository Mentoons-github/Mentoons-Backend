const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  status: {
    type: String,
    enum: ["initiated", "pending", "processing", "success", "failed", "cancelled", "refunded"],
    default: "initiated",
  },
  paymentGateway: {
    type: String,
    required: true,
  },
  transactionId: String,
  trackingId: String,
  bankRefNo: String,
  failureMessage: String,
  paymentMode: {
    type: String,
    enum: ["credit_card", "debit_card", "net_banking", "upi", "wallet", "emi", "other"]
  },
  cardName: String,
  statusMessage: String,
  customerDetails: {
    name: String,
    email: String,
    phone: String,
  },
  responseData: mongoose.Schema.Types.Mixed,
  attempts: [
    {
      timestamp: Date,
      status: String,
      response: mongoose.Schema.Types.Mixed,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
