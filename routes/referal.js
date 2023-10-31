// In your routes file (e.g., referralRoutes.js or any appropriate file)

const express = require("express");
const router = express.Router();
const Referral = require("../models/referal");
router.get("/referrals", async (req, res, next) => {
    try {
      const allReferrals = await Referral.find().populate({
        path: 'referrer',
        select: 'email' // Select the 'email' field of the referrer
      }).populate({
        path: 'referee',
        select: 'email' // Select the 'email' field of the referee
      });
  
      const referralEmails = allReferrals.map(referral => {
        return {
          referrerEmail: referral.referrer.email,
          refereeEmail: referral.referee.email
        };
      });
  
      res.status(200).json(referralEmails);
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
