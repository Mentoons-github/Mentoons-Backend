const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const workshopEnquiriesSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: {
      type: Number,
      required: [true, "Phone number is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    workshop: {
      type: String,
      required: [true, "Workshop is required"],
    },
    ageCategory: {
      type: String,
      //   required: [true, "Age is required"],
    },
    guardianName: {
      type: String,
      //   required: [true, "Guardian's name is required"],
    },
    guardianContact: {
      type: String,
      //   required: [true, "Guardian's phone no is required"],
    },
    guardianEmail: {
      type: String,
      //   required: [true, "Guardian's email is required!"],
    },
    city: {
      type: String,
      lowercase: true,
      //   required: [true, "City is required"],
    },
    duration: {
      type: String,
      //   required: [true, "Duration is required"],
      enum: ["2days", "6months", "12months"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("workshopEnquiries", workshopEnquiriesSchema);
