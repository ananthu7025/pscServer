const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/auth");
const paymentRoutes = require('./routes/payment');
const questionRoutes = require('./routes/question');
const resultRoutes = require('./routes/result');
const folderRouter = require('./routes/folder');
const referralRoutes = require('./routes/referal');
const userRoutesAdmin = require('./routes/admin');
const CurrentAffairs = require('./routes/currentAffairs');
const folderFech = require('./routes/folderFetch');
const specialTopic = require('./routes/specialTopic');
const categoryRoutes = require('./routes/catogorey');
const subcategoryRoutes = require('./routes/subcatogorey');
const  ExamRoute= require('./routes/examcalnder');
const  pscbulletRoute= require('./routes/pscbullet');
const  previousYearRoute= require('./routes/previousyear');

const path = require('path');
const errorHandler = require("./errorHandler");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3030;

mongoose.connect("mongodb+srv://pscgreenlearning:pscgreen@pscgreen.m19r6fm.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public/build')));
app.use("/api/user", userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', questionRoutes);
app.use('/api', resultRoutes);
app.use('/api/folders', folderRouter);
app.use('/api', referralRoutes);
app.use('/api/admin/users', userRoutesAdmin);
app.use('/api', CurrentAffairs);
app.use('/api', folderFech);
app.use('/api', specialTopic);
app.use('/api', categoryRoutes);
app.use('/api', subcategoryRoutes);
app.use('/api', ExamRoute);
app.use('/api', pscbulletRoute);
app.use('/api', previousYearRoute);





app.get('/api/abhi/test', function(req, res) {
  res.send('test Workflow success');
});
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
});
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
