const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
