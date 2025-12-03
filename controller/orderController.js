const Order = require("../models/Order");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");

const crypto = require("crypto");

const generateTrackingId = () => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `MSH-${random}`;    // Looks like Meesho
};

const generateUniqueTracking = async () => {
  let trackingId;
  let exists = true;

  while (exists) {
    trackingId = generateTrackingId();
    exists = await Order.findOne({ trackingId });
  }
  return trackingId;
};

exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentId, razorpayOrderId, signature } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items found in order." });
    }

    const order = new Order({
      user: req.user.id,
      items: items.map((item) => ({
        carpet: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      paymentId,
      razorpayOrderId,
      signature,
      paymentStatus: "Paid",
      status: "Processing",
    });

    // ✅ Generate unique tracking ID here
    order.trackingId = await generateUniqueTracking();

    await order.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};


/**
 * 🧍 Get all orders for the logged-in user
 */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.carpet", "name price image")
      .sort({ createdAt: -1 }); // ✅ correct field

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      message: "Error fetching your orders",
      error: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email mobile")
      .populate("items.carpet", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      message: "Error fetching all orders",
      error: error.message,
    });
  }
};


/**
 * 🚚 Update order status (Admin only)
 */

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
   const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = [
      "Processing",
      "Picked Up",
      "Out for Delivery",
      "Delivered",
      "Failed/Returned",
      "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    order.status = status;
    await order.save();

        await sendEmail(
      order.user.email,
      `Your Order is now ${status}`,
      `
        <h2>Order Update</h2>
        <p>Hello ${order.user.name},</p>
        <p>Your order <b>${order.trackingId}</b> status is updated to:</p>
        <h3>${status}</h3>
      `
    );


    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Server error while updating status",
      error: error.message,
    });
  }
};


// backend/controller/orderController.js
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.carpet", "name price image")
      .populate("deliveryBoy", "name email")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optional: make sure a user can only access their own order
    if (req.user.role !== "Admin" && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};


// Cancel order (User)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only the user who placed the order can cancel
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // Only allow cancellation if order is not shipped or out for delivery
    if (["Picked Up", "Out for Delivery", "Delivered", "Failed/Returned", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order at ${order.status} stage` });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};
