// backend/routes/paymentRoutes.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Carpet = require("../models/Carpet");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 📌 Create Razorpay order
router.post("/order", protect, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    const options = { amount, currency, receipt };
    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).send("Unable to create Razorpay order");
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send("Server Error");
  }
});

// 📌 Validate payment + Save order
// 📌 Validate payment + Save order in MongoDB
router.post("/order/validate", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      totalAmount,
      address,
      upiId,
    } = req.body;

    console.log("🧾 Incoming order validation request:");
    console.log({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      totalAmount,
      address,
      upiId,
      cartItems,
    });

    // ✅ Validate required fields before proceeding
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const digest = hmac.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid transaction signature" });
    }

    // ✅ Create order
    const newOrder = new Order({
      user: req.user._id,
      items: cartItems.map((item) => ({
        carpet: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      paymentStatus: "Paid",
      address,
      upiId,
    });

    await newOrder.save();
       for (const item of cartItems) {
      await Carpet.findByIdAndUpdate(item._id, {
        $inc: { stock: -item.quantity },
      });
    }

    console.log("✅ Order saved:", newOrder);

    res.json({
      success: true,
      message: "Payment verified and order saved successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error validating payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error during payment validation",
      error: error.message,
    });
  }
});


module.exports = router;
