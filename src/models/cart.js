const mongoose = require("mongoose");
const { ProductType, AgeCategory, CardType } = require("../utils/enum");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", 
          required: true,
        },
        productType: {
          type: String,
          enum: Object.values(ProductType),
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        ageCategory: {
          type: String,
          enum: Object.values(AgeCategory),
        },
        productImage: {
          type: String, // URL to the main product image
        },
        cardType: {
          type: String,
          enum: Object.values(CardType),
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
        productDetails: {
          type: mongoose.Schema.Types.Mixed, // Store any additional product details
        },
      },
    ],
    totalItemCount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    appliedCoupon: {
      code: String,
      discountAmount: Number,
      discountType: {
        type: String,
        enum: ["percentage", "fixed"],
      },
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to calculate total price and item count
CartSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.totalItemCount = this.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    this.totalPrice = this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Apply discount if coupon is applied
    if (this.appliedCoupon) {
      if (this.appliedCoupon.discountType === "percentage") {
        this.discountedPrice =
          this.totalPrice -
          this.totalPrice * (this.appliedCoupon.discountAmount / 100);
      } else {
        this.discountedPrice = Math.max(
          0,
          this.totalPrice - this.appliedCoupon.discountAmount
        );
      }
    } else {
      this.discountedPrice = this.totalPrice;
    }
  } else {
    this.totalItemCount = 0;
    this.totalPrice = 0;
    this.discountedPrice = 0;
  }
  next();
});

module.exports = mongoose.model("Cart", CartSchema);
