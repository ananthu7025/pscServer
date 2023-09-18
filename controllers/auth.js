const User = require("../models/User");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ananthapadmanabhan7025@gmail.com",
    pass: "ayoycsctlsajhbbd",
  },
});

const OTP_EXPIRY_TIME = 60 * 1000; 

function sendOTPByEmail(email, otp) {
  const mailOptions = {
    from: "ananthapadmanabhan7025@gmail.com",
    to: email,
    subject: "Your OTP Verification Code",
    html: getEmailTemplate(otp),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
    } else {
      console.log("OTP sent:", info.response);
    }
  });
}

function getEmailTemplate(otp) {
  const templatePath = path.join(__dirname, "../templates", "email-template.html");

  try {
    const emailTemplate = fs.readFileSync(templatePath, "utf-8");
    return emailTemplate.replace("{{otp}}", otp);
  } catch (error) {
    console.error("Error reading email template:", error);
    return "";
  }
}

async function registerUser(req, res, next) {
  const { email, isPaid = false } = req.body;
  const otp = generateRandomNumber(1000, 9999);
  const otpCreatedAt = new Date(); 

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.otp = otp;
      user.otpCreatedAt = otpCreatedAt;
      user.isPaid = isPaid;
    } else {
      user = new User({ email, otp, isVerified: false, isPaid, otpCreatedAt });
    }

    await user.save();
    sendOTPByEmail(email, otp);

   res.status(201).send({
          message: "OTP sent. Check your email for OTP.",
        });
  } catch (error) {
    next(error);
  }
}


function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function verifyOTP(req, res, next) {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    if (user.otp && user.otp === otp) {
      const currentTime = new Date();
      const otpCreationTime = new Date(user.otpCreatedAt);

      if (currentTime - otpCreationTime > OTP_EXPIRY_TIME) {
        return res.status(401).send("OTP has expired.");
      }

      user.isVerified = true;
      await user.save();

      const accessToken = generateAccessToken(user);
      return res.status(200).json({
        message: "OTP verified successfully.",
        user: {
          email: user.email,
          isVerified: user.isVerified,
          isPaid: user.isPaid,
        },
        accessToken: accessToken,
      });
    } else {
      return res.status(401).send("Invalid OTP.");
    }
  } catch (error) {
    next(error);
  }
}

function generateAccessToken(user) {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      userEmail: user.email,
    },
    "your-secret-key",
    { expiresIn: "30d" }
  );
  return accessToken;
}

module.exports = {
  registerUser,
  verifyOTP,
};
