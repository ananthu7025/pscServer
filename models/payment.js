// models/payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  amount: Number,
  status: String,
});

module.exports = mongoose.model('Payment', paymentSchema);
