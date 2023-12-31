const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: "rzp_test_h8IfBaZ34VQ0c6",
  key_secret: "NzQR1Bt4fjXTDLxrrvSKGbHf",
});

const createOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something Went Wrong!" });
      }
      res.status(200).json({ data: order });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
};

const verifyPayment = async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } =
        req.body;
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", 'NzQR1Bt4fjXTDLxrrvSKGbHf')
        .update(sign.toString())
        .digest("hex");
  
      if (razorpay_signature === expectedSign) {
        const user = await User.findOne({ email });
  
        if (user) {
          user.isPaid = true;
          await user.save();
        }
  
        return res.status(200).json({ message: "Payment verified successfully" });
      } else {
        return res.status(400).json({ message: "Invalid signature sent!" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error!" });
      console.log(error);
    }
  };
  
module.exports = {
  createOrder,
  verifyPayment,
};
