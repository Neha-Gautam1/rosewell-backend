const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, moveToCart } = require('../controller/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const Wishlist = require("../models/Wishlist");

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/:id', protect, removeFromWishlist);
router.patch('/:id', protect, moveToCart);
router.get("/count", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Count wishlist items for user
    const count = await Wishlist.countDocuments({ user: userId });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;