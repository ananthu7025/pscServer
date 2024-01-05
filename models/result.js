const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  userSelectedOption: String,
});

const resultSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Result', resultSchema);
