const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

// Get Cart
exports.getCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.carpet");
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};


// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { carpetId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.carpet.toString() === carpetId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ carpet: carpetId, quantity: quantity || 1 });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.carpet");
    res.status(200).json(populatedCart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding to cart', error });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => item.carpet.toString() !== req.params.id
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error });
  }
};

// Move from Cart to Wishlist
exports.moveToWishlist = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const wishlist =
      (await Wishlist.findOne({ user: req.user._id })) ||
      new Wishlist({ user: req.user._id, items: [] });

    const itemIndex = cart.items.findIndex(
      (item) => item.carpet.toString() === req.params.id
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: 'Item not found in cart' });

    const [item] = cart.items.splice(itemIndex, 1);
    wishlist.items.push({ carpet: item.carpet });

    await cart.save();
    await wishlist.save();

    res.status(200).json({ cart, wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error moving item', error });
  }
};

// Update quantity in Cart
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: 'Quantity must be at least 1' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      (item) => item.carpet.toString() === req.params.id
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quantity', error });
  }
};

// Get Cart Count
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart
      ? cart.items.reduce((acc, item) => acc + (item.quantity || 1), 0)
      : 0;
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart count', error });
  }
};