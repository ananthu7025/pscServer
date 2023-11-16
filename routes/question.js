const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question');
const question = require('../models/question');

router.post('/create-question', questionController.createQuestion);
router.get('/questions', questionController.getQuestions);
router.put('/edit-question/:questionId', questionController.editQuestion);
router.get('/get-question/:questionId', questionController.getQuestionById);
router.delete('/delete-question/:questionId', questionController.deleteQuestion);
router.get('/all-questions', async (req, res) => {
    try {
      const questions = await question.find();
      res.json(questions);
    } catch (err) {
      errorHandler(res, err);
    }
  });
module.exports = router;
