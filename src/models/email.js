const mongoose = require("mongoose");
const validator = require("validator");

const phoneRegex = /^\d{10,15}$/;
const countryCodeRegex = /^\+[1-9]{1}[0-9]{1,3}$/;

const emailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: [true, 'Name is Requied'],
      minlength: [3, "Name should be more than 3 characters"],
      maxlength: [50, "Name should be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is Requied"],
      validate: {
        validator: validator.isEmail,
        message: "Use a valid email",
      },
    },
    phone: {
      type: String,
      // required: [true, 'Phone number is required'],
      validate: {
        validator: function (phone) {
          return phoneRegex.test(phone);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    countryCode: {
      type: String,
      // required: [true, 'Country code is required'],
      validate: {
        validator: function (cc) {
          return countryCodeRegex.test(cc);
        },
        message: (props) => `${props.value} is not a valid country code!`,
      },
    },
    message: {
      type: String,
      maxlength: [500, "Message cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;
