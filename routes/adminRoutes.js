// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const User = require("../models/User");

router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "Admin" } });
    const totalOrders = await Order.countDocuments();
    const totalSalesAgg = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    res.json({
      totalUsers,
      totalOrders,
      totalSales,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Error fetching admin stats" });
  }
});

module.exports = router;
