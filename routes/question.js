const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question');

// Create a new question
router.post('/create-question', questionController.createQuestion);

// Get questions based on category and subcategory
router.get('/questions', questionController.getQuestions);

module.exports = router;
