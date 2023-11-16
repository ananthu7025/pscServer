const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/auth");
const paymentRoutes = require('./routes/payment');
const questionRoutes = require('./routes/question');
const resultRoutes = require('./routes/result');
const fileUploadRoutes = require('./routes/fileUpload');
const folderRouter = require('./routes/folder');
const referralRoutes = require('./routes/referal');
const userRoutesAdmin = require('./routes/admin');
const CurrentAffaris = require('./routes/currentAffairs');
const folderFech = require('./routes/folderFetch');
const studyPlan = require('./routes/studyPlan');


const errorHandler = require("./errorHandler");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3030;

mongoose.connect("mongodb://127.0.0.1:27017/PSC?directConnection=true", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(errorHandler);
app.use(cors());
app.use('/', fileUploadRoutes);

app.use("/user", userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/', questionRoutes);
app.use('/', resultRoutes);
app.use('/folders', folderRouter);
app.use('/', referralRoutes);
app.use('/admin/users', userRoutesAdmin);
app.use('/', CurrentAffaris);
app.use('/', folderFech);
app.use('/', studyPlan);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
