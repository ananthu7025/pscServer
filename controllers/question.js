const Question = require('../models/question');

// Create a new question
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

// Get questions based on category and subcategory
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

module.exports = {
  createQuestion,
  getQuestions,
};
