const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "unsubscribed"],
      default: "active",
    },
  },
  { timestamps: true }
);
// Create and export the model
const Newsletter = mongoose.model("Newsletter", newsletterSchema);
module.exports = Newsletter;
