
const express = require("express");
const router = express.Router();
const userController = require("../controllers/auth");

router.post("/register", userController.registerUser);
router.post("/verify", userController.verifyOTP);
router.post("/resend-otp", userController.resendOTP);

module.exports = router;
