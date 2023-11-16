const User = require("../models/User");

const express = require("express");
const router = express.Router();
const Referral = require("../models/referal");

router.get('/', async (req, res, next) => {
    try {
      const users = await User.find({}, '-password'); 
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  });
module.exports = router;
