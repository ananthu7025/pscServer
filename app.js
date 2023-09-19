
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/auth");
const paymentRoutes = require('./routes/payment');
const errorHandler = require("./errorHandler");
var cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3030;
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/PSC?directConnection=true", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(errorHandler);
app.use("/user", userRoutes);
app.use('/api/payment', paymentRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
