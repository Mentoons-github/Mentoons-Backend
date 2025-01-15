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
    enum: ["initiated", "pending", "success", "failed", "cancelled"],
    default: "initiated",
  },
  trackingId: String,
  bankRefNo: String,
  failureMessage: String,
  paymentMode: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PaymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Payment", PaymentSchema);
