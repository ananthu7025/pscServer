const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    userID: mongoose.Schema.Types.ObjectId,
    score: Number,
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Result', resultSchema);
