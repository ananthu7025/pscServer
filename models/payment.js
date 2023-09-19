// models/payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  amount: Number,
  status: String,
  // Add other fields as needed
});

module.exports = mongoose.model('Payment', paymentSchema);
