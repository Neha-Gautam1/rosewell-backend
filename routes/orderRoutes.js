const express = require("express");
const User = require("../models/User");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
} = require("../controller/orderController");
const { protect,adminOnly} = require("../middleware/authMiddleware");

// 🛒 Create a new carpet order (User)
router.post("/", protect, createOrder);

// 👤 Get all orders for logged-in user
router.get("/myorders", protect, getMyOrders);

// 🧑‍💼 Admin: Get all orders
router.get("/", protect, adminOnly, getAllOrders);

router.put("/:id/status", protect, adminOnly, updateOrderStatus);
// ✅ Admin: Get all delivery boys
router.get("/delivery-boys", protect, adminOnly, async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: "Delivery" }).select("name email");
    res.json(deliveryBoys);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching delivery boys",
      error: error.message,
    });
  }
});


// Get order by ID (User/Admin)
router.get("/:id", protect, getOrderById);

// Cancel order (User)
router.put("/:id/cancel", protect, cancelOrder);


module.exports = router;
