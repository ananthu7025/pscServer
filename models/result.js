const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  score: Number,
});

module.exports = mongoose.model('Result', resultSchema);
