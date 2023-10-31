const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result');

// Submit quiz answers and calculate score
router.post('/submit-quiz', resultController.submitQuiz);

// Get user's results
router.get('/user-results/:userID', resultController.getUserResults);

module.exports = router;
