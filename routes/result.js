const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result');

router.post('/submit-quiz', resultController.submitQuiz);

router.get('/user-results/:userID', resultController.getUserResults);
router.get('/quiz-details/:resultID', resultController.getQuizDetails);
module.exports = router;
