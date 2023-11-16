
const express = require("express");
const router = express.Router();
const userController = require("../controllers/auth");

router.post("/register", userController.registerUser);
router.post("/verify", userController.verifyOTP);
router.post("/resend-otp", userController.resendOTP);
router.get("/userDetails",  userController.getUserDetails);
router.post("/create-profile", userController.createProfile);
router.put("/update-isPaid", userController.updateIsPaidStatus);
module.exports = router;
