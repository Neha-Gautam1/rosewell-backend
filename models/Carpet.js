const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const carpetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  discount: { type: Number, default: 0 },
  category: { type: String, enum: ["traditional", "vintage", "modern", "contemporay","persian","doormat"],  required: true },
  stock: { type: Number, default: 0 },
  /* ⭐ NEW FIELDS ⭐ */

    details: { type: String },       // product details
    disclaimer: { type: String },    // disclaimer text
    dimensions: { type: String },    // size/dimension text
    care: { type: String },          // care instructions
    color: { type: String },         // product color
  
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model("Carpet", carpetSchema);
