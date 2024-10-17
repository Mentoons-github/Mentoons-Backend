const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "super-admin", "user"], // Add your allowed roles here
    required: true,
    default:"user"
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  picture: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
