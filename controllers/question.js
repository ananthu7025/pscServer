const Question = require('../models/question');

const createQuestion = async (req, res) => {
  try {
    const { category, subCategory, questionText, options, correctAnswer } = req.body;
    const question = new Question({ category, subCategory, questionText, options, correctAnswer });
    await question.save();
    res.json({ message: 'Question created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Question creation failed' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    const questions = await Question.find({ category, subCategory });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};
const editQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { category, subCategory, questionText, options, correctAnswer } = req.body;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { category, subCategory, questionText, options, correctAnswer },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question updated successfully', question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update question' });
  }
};
const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch question by ID' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findByIdAndDelete(questionId);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  editQuestion,
  deleteQuestion,getQuestionById
};
