const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp: String,
  isVerified: Boolean,
  isPaid: { type: Boolean, default: false },
  otpCreatedAt: Date,
  phone: String,
  name: String,
  district: String,
  isCreated: Boolean,
  referralCode: String, 
  isAdmin: { type: Boolean,default: false }, 
});

module.exports = mongoose.model("User", userSchema);
