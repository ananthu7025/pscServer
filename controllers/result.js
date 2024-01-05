const Result = require('../models/result');
const Question = require('../models/question');

const submitQuiz = async (req, res) => {
  try {
    const { userID, answers } = req.body;
    const questions = await Question.find({});
    let score = 0;

    const userSelectedOptions = [];

    for (const answer of answers) {
      const question = questions.find((q) => q._id.toString() === answer.questionID);

      if (question && question.correctAnswer === answer.selectedOption) {
        score++;
      }

      userSelectedOptions.push({
        questionID: answer.questionID,
        userSelectedOption: answer.selectedOption,
      });
    }

    const result = new Result({ userID, score, questions: userSelectedOptions });
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

const getQuizDetails = async (req, res) => {
  try {
    const { resultID } = req.params;

    const result = await Result.findById(resultID);

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    if (!result.questions || !Array.isArray(result.questions)) {
      return res.status(400).json({ error: 'Invalid quiz data' });
    }

    const questionsDetails = await Promise.all(
      result.questions.map(async (question) => {
        const questionDetails = await Question.findById(question.questionID);

        if (!questionDetails) {
          return {
            error: 'Question details not found',
          };
        }

        return {
          question: questionDetails.questionText,
          options: questionDetails.options,
          userSelectedOption: question.userSelectedOption,
          correctOption: questionDetails.correctAnswer,
        };
      })
    );

    res.json({
      quizID: result._id,
      userID: result.userID,
      score: result.score,
      questionsDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz details' });
  }
};

module.exports = {
  submitQuiz,
  getUserResults,
  getQuizDetails,
};
