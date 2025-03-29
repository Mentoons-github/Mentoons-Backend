const mongoose = require("mongoose");

const temporaryUserSchema = new mongoose.Schema({
  orderId: { type: String, required: true, ref: "Order", unique: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 },
});

const TemporaryUser = mongoose.model("TemporaryUser", temporaryUserSchema);

module.exports = TemporaryUser;
