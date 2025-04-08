const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
    enum: ["cards", "book", "session"],
  },
  date: {
    type: String,
    required: false,
  },
  time: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    default: "No additional details provided",
  },
});

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { _id: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "debit_card",
        "upi",
        "net_banking",
        "wallet",
        "other",
      ],
      required: true,
    },
    transactionId: String,
    paymentStatus: {
      type: String,
      enum: ["initiated", "processing", "completed", "failed", "refunded"],
      default: "initiated",
    },
    paymentDate: Date,
    gatewayResponse: Object,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    paymentDetails: paymentDetailsSchema,
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    order_type: {
      type: String,
      enum: [
        "product_purchase",
        "subscription_purchase",
        "consultancy_purchase",
        "assessment_purchase",
      ],
    },
    orderStatus: {
      type: String,
      enum: ["Success", "Aborted", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    sameAsShipping: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    productInfo: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "SUCCESS",
        "FAILURE",
        "ABORTED",
        "INVALID",
        "CANCELLED",
        "UNKNOWN",
      ],
      default: "PENDING",
    },
    paymentId: {
      type: String,
    },
    bankRefNumber: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paymentResponse: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
orderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = async function (status) {
  this.orderStatus = status;
  return await this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function (
  status,
  transactionId = null,
  gatewayResponse = null
) {
  if (!this.paymentDetails) {
    this.paymentDetails = {};
  }
  this.paymentDetails.paymentStatus = status;
  if (transactionId) this.paymentDetails.transactionId = transactionId;
  if (gatewayResponse) this.paymentDetails.gatewayResponse = gatewayResponse;
  if (status === "completed") this.paymentDetails.paymentDate = new Date();

  // Update order status based on payment status
  if (status === "completed") this.orderStatus = "processing";
  if (status === "failed") this.orderStatus = "failed";
  if (status === "refunded") this.orderStatus = "refunded";

  return await this.save();
};

// Method to add item to order
orderSchema.methods.addItem = function (item) {
  this.items.push(item);
  return this;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
