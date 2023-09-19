const express = require("express");
const router = express.Router();
const razorpayController = require("../controllers/payment");

router.post("/orders", razorpayController.createOrder);
router.post("/verify", razorpayController.verifyPayment);

module.exports = router;
