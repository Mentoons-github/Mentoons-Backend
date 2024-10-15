const mongoose = require("mongoose");
const validator = require("validator");
const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
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
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
