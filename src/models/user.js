const mongoose = require("mongoose");
const validator = require("validator");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, "Name is required"],
    minlength: [3, "Name should be more than 3 characters"],
    maxlength: [50, "Name should be more than 50 characters"],
  },
  email: {
    type: String,
    // required: [true, "Email is Requied"],
    validate: {
      validator: validator.isEmail,
      message: "Use a valid email",
    },
  },
  phoneNumber: {
    type: String,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpiresAt: {
    type: Date,
  },
  refreshToken: {
    type: String,
  },
  password: {
    type: String,
    // required: [true, "Password is required"],
    validate: {
      validator: function (value) {
        const errors = [];
        if (!/[A-Z]/.test(value)) {
          errors.push("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(value)) {
          errors.push("Password must contain at least one lowercase letter");
        }
        if (!/[0-9]/.test(value)) {
          errors.push("Password must contain at least one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          errors.push("Password must contain at least one special character");
        }
        if (errors.length > 0) {
          throw new Error(errors.join(", "));
        }
        return true;
      },
      message: (props) => props.reason.message,
    },
  },
  age: {
    type: String,
  },
  coins: {
    type: String,
  },
  city: {
    type: String,
  },
  premiumStartDate: {
    type: Date,
  },
  premiumEndDate: {
    type: Date,
  },
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
  isPremiumUser: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
