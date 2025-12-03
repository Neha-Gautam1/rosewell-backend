const Carpet = require("../models/Carpet");
const cloudinary = require("../config/cloudinary.js");
// Get all carpets (with optional filters: name, category)
exports.getAllCarpets = async (req, res) => {
  try {
    const { name, category } = req.query;
    let filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (category) filter.category = category;

    const carpets = await Carpet.find(filter);
    res.json(carpets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get carpet by ID
exports.getCarpetById = async (req, res) => {
  try {
    const carpet = await Carpet.findById(req.params.id).populate("reviews.user", "name");
    if (!carpet) return res.status(404).json({ message: "Carpet not found" });
    res.json(carpet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new carpet
exports.createCarpet = async (req, res) => {
  try {
    let imageUrl = "";

    // If frontend sends a file
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        { folder: "carpets" }
      );
      imageUrl = result.secure_url;
    }

    const { name, description, price, discount, category, stock,
       // NEW FIELDS
      details,
      disclaimer,
      dimensions,
      care,
      color } = req.body;

       let craftsmenArray = [];
    if (craftsmen) {
      craftsmenArray = Array.isArray(craftsmen)
        ? craftsmen
        : craftsmen.split(",").map((c) => c.trim());
    }


    const carpet = new Carpet({
      name,
      description,
      price,
      image: imageUrl,
      discount,
      category,
      stock,
       // NEW FIELDS
      details,
      disclaimer,
      dimensions,
      care,
      color
    });

    const newCarpet = await carpet.save();
    res.status(201).json(newCarpet);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


// Update carpet by ID
exports.updateCarpet = async (req, res) => {
  try {
    const carpet = await Carpet.findById(req.params.id);
    if (!carpet) return res.status(404).json({ message: "Carpet not found" });

    const { name, description, price, discount, category, stock,// NEW
      details,
      disclaimer,
      dimensions,
      care,
      color} = req.body;

    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        { folder: "carpets" }
      );
      carpet.image = result.secure_url;
    }

    if (name !== undefined) carpet.name = name;
    if (description !== undefined) carpet.description = description;
    if (price !== undefined) carpet.price = price;
    if (discount !== undefined) carpet.discount = discount;
    if (category !== undefined) carpet.category = category;
    if (stock !== undefined) carpet.stock = stock;
      if (details !== undefined) carpet.details = details;
    if (disclaimer !== undefined) carpet.disclaimer = disclaimer;
    if (dimensions !== undefined) carpet.dimensions = dimensions;
    if (care !== undefined) carpet.care = care;
    if (color !== undefined) carpet.color = color;



    const updatedCarpet = await carpet.save();
    res.json(updatedCarpet);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};


// Delete carpet by ID
exports.deleteCarpet = async (req, res) => {
  try {
    const carpet = await Carpet.findById(req.params.id);
    if (!carpet) return res.status(404).json({ message: "Carpet not found" });

    await Carpet.findByIdAndDelete(req.params.id);
    res.json({ message: "Carpet deleted" });
  } catch (err) {
    console.error("Error deleting carpet:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add review to a carpet
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const carpet = await Carpet.findById(req.params.id);
    if (!carpet) return res.status(404).json({ message: "Carpet not found" });

    const newReview = {
      user: req.user.id,
      rating,
      comment
    };

    carpet.reviews.push(newReview);
    await carpet.save();

    res.status(201).json({ message: "Review added", reviews: carpet.reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete review from a carpet
exports.deleteReview = async (req, res) => {
  try {
    const carpet = await Carpet.findById(req.params.id);
    if (!carpet) return res.status(404).json({ message: "Carpet not found" });

    carpet.reviews = carpet.reviews.filter(
      (rev) => rev._id.toString() !== req.params.reviewId.toString()
    );
    await carpet.save();

    res.json({ message: "Review deleted", reviews: carpet.reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
