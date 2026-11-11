const mongoose = require("mongoose");

const CATEGORIES = [
  "daily",
  "salary",
  "freelancer",
  "incentive",
  "infrastructure",
  "miscellaneous",
];

const EXPENSE_TYPES = ["internal", "external"];

const PAYMENT_MODES = [
  "cash",
  "upi",
  "bank_transfer",
  "card",
  "cheque",
  "other",
];

const PAYMENT_STATUSES = ["paid", "pending"];

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
      index: true,
    },
    // internal = team / in-house spending, external = outside vendors / third parties
    expenseType: {
      type: String,
      enum: EXPENSE_TYPES,
      required: true,
      default: "internal",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    paymentMode: {
      type: String,
      enum: PAYMENT_MODES,
      required: true,
    },
    transactionRef: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "paid",
    },

    // Used by salary / freelancer / incentive
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employees",
      required: false,
    },

    // Used for salary (which month the salary is for)
    salaryMonth: { type: Number, min: 1, max: 12 },
    salaryYear: { type: Number },

    // Used for external expenses (shops, vendors, agencies...)
    vendorName: {
      type: String,
      trim: true,
      default: "",
    },
    billNumber: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

expenseSchema.index({ category: 1, date: -1 });

const Expense = mongoose.model("Expense", expenseSchema);

Expense.CATEGORIES = CATEGORIES;
Expense.EXPENSE_TYPES = EXPENSE_TYPES;
Expense.PAYMENT_MODES = PAYMENT_MODES;
Expense.PAYMENT_STATUSES = PAYMENT_STATUSES;

module.exports = Expense;
