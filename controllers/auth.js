const User = require("../models/User");
const Referral = require("../models/referal");

const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");


function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access token is missing." });
  }
  const accessToken = authHeader.replace("Bearer ", "");

  const secretKey = "your-secret-key";

  jwt.verify(accessToken, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid access token." });
    }
    req.user = decoded;n in t
    next();
  });
}

function generateReferralCode() {
  let referralCode = "";

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = 6;

  for (let i = 0; i < codeLength; i++) {
    referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return referralCode;
}


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pscgreen.learning@gmail.com",
    pass: "enoq xacj wrwc uvlt",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const OTP_EXPIRY_TIME = 5 * 60 * 1000; 

function sendOTPByEmail(email, otp) {
  console.log(otp)
  const mailOptions = {
    from: "pscgreen.learning@gmail.com",
    to: email,
    subject: "Your OTP Verification Code",
    html: getEmailTemplate(otp),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
    } else {
      console.log(info)
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
  const { email } = req.body;
  const otp = generateRandomNumber(1000, 9999);
  const otpCreatedAt = new Date(); 

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.otp = otp;
      user.otpCreatedAt = otpCreatedAt;
    } else {
      user = new User({ email, otp, isVerified: false, otpCreatedAt,isCreated:false });
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

      if (user.isVerified) {
        user.isCreated = true;
        await user.save();
      } else {
        user.isVerified = true;
      }

      if (!user.referralCode) {
        user.referralCode = generateReferralCode();
      }

      await user.save();

      const accessToken = generateAccessToken(user);
      return res.status(200).json({
        message: "OTP verified successfully.",
        user: {
          email: user.email,
          isVerified: user.isVerified,
          isPaid: user.isPaid,
          userId: user._id,
          isCreated: user.isCreated,
          referralCode: user.referralCode, 
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

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
async function createProfile(req, res, next) {
  try {
    const { phone, name, district, userId, referralCode } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isCreated) {
      return res.status(200).json({ message: "User profile has already been created.", user: user });
    }

    user.phone = phone;
    user.name = name;
    user.district = district;
    user.isCreated = true;

    if (referralCode) {
      const referredUser = await User.findOne({ referralCode });

      if (referredUser) {
        const referral = new Referral({
          referrer: referredUser._id,
          referee: user._id,
        });

        await referral.save();
      }
    }

    await user.save();
    sendNewUserEmail(user);

    const updatedUser = await User.findById(userId);

    res.status(201).json({ message: "User profile created successfully.", user: updatedUser });
  } catch (error) {
    next(error);
  }
}



async function resendOTP(req, res, next) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const currentTime = new Date();
    const otpCreationTime = new Date(user.otpCreatedAt);
    const newOTP = generateRandomNumber(1000, 9999);
    user.otp = newOTP;
    user.otpCreatedAt = currentTime;
    await user.save();

    sendOTPByEmail(email, newOTP);

    return res.status(201).send({
      message: "OTP resent successfully.",
    });

  } catch (error) {
    next(error);
  }
}
async function getUserDetails(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token is missing or invalid." });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = "your-secret-key"; 

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid access token." });
      }

      const { userId } = decoded;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      const userDetails = {
        _id:user._id,
        email: user.email,
        isVerified: user.isVerified,
        isPaid: user.isPaid,
        phone: user.phone,
        name: user.name,
        district: user.district,
        isCreated: user.isCreated,
        referralCode: user.referralCode,
        isAdmin:user.isAdmin
      };
      res.status(200).json(userDetails);
    });
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
async function updateIsPaidStatus(req, res, next) {
  try {
    const { userId, isPaid } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isPaid = isPaid;
    await user.save();

    res.status(200).json({
      message: `isPaid status updated successfully for user ${userId}.`,
      user: {
        _id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        isPaid: user.isPaid,
      },
    });
  } catch (error) {
    next(error);
  }
}
function sendNewUserEmail(user) {
  const adminEmail = "pscgreen.learning@gmail.com";

  const mailOptions = {
    from: "pscgreen.learning@gmail.com",
    to: adminEmail,
    subject: "New User Registration",
    html: getNewUserEmailTemplate(user),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending new user email:", error);
    } else {
    }
  });
}

function getNewUserEmailTemplate(user) {
  const templatePath = path.join(__dirname, "../templates", "new-user-template.html");

  try {
    const emailTemplate = fs.readFileSync(templatePath, "utf-8");
    return emailTemplate.replace("{{userEmail}}", user.email)
                       .replace("{{userName}}", user.name)
                       .replace("{{userPhone}}", user.phone)
                       .replace("{{userDistrict}}", user.district);
  } catch (error) {
    console.error("Error reading new user email template:", error);
    return "";
  }
}

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  verifyAccessToken,
  updateIsPaidStatus,
  getUserDetails,
  createProfile
};
