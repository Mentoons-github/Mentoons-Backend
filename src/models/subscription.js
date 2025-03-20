const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    firstname: {
      tyep: String,
      required: [true, "First name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    lastname: {
      tyep: String,
      required: [true, "Last name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      min: [0, "Price must be a greater than 0 "],
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },
    frequency: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    category: {
      type: String,
      enum: ["basic", "platinum"],
      default: "basic",
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Start date must be in the past",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after start date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

//Auto-calculate renewal date if missing

subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalPeriods = {
      monthly: 30,
      yearly: 365,
    };
    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency]
    );
  }
  //Auto-update the status if renewal date is in the passed
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
