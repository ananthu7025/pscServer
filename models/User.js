const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  otp: String,
  isVerified: Boolean,
  isPaid: Boolean,
  otpCreatedAt: Date,
});

module.exports = mongoose.model("User", userSchema);
