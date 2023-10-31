const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/PSC_test?directConnection=true', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(-1);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define Mongoose schemas for User, Question, and Result
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const questionSchema = new mongoose.Schema({
  category: String,
  subCategory: String,
  questionText: String,
  options: [String],
  correctAnswer: Number,
});

const resultSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  score: Number,
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);
const Result = mongoose.model('Result', resultSchema);

// API routes for quiz app

// Create a new user (register endpoint)
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Log in a user (login endpoint)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
    } else {
      res.json({ message: 'Login successful' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});
app.post('/create-question', async (req, res) => {
    try {
      const { category, subCategory, questionText, options, correctAnswer } = req.body;
      const question = new Question({ category, subCategory, questionText, options, correctAnswer });
      await question.save();
      res.json({ message: 'Question created successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Question creation failed' });
    }
  });
// Get questions based on category and subcategory
app.get('/questions', async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    const questions = await Question.find({ category, subCategory });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Submit quiz answers and calculate score
app.post('/submit-quiz', async (req, res) => {
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
});

// Get user's results
app.get('/user-results/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const results = await Result.find({ userID });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user results' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
