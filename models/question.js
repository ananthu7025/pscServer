const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: String,
  subCategory: String,
  questionText: String,
  options: [String],
  correctAnswer: Number,
});

module.exports = mongoose.model('Question', questionSchema);
