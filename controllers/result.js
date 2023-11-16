const Result = require('../models/result');
const Question = require('../models/question');

const submitQuiz = async (req, res) => {
  try {
    const { userID, answers } = req.body;
    const questions = await Question.find({});
    let score = 0;

    for (const answer of answers) {
      const question = questions.find((q) => q._id.toString() === answer.questionID);

      if (question && question.correctAnswer === answer.selectedOption) {
        score++;
      }
    }

    const result = new Result({ userID, score });
    await result.save();
    res.json({ message: 'Quiz submitted successfully', score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

const getUserResults = async (req, res) => {
  try {
    const { userID } = req.params;
    const results = await Result.find({ userID });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user results' });
  }
};

module.exports = {
  submitQuiz,
  getUserResults,
};
