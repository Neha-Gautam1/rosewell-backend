const express = require("express");
const router = express.Router();
const {
  getAllCarpets,
  getCarpetById,
  createCarpet,
  updateCarpet,
  deleteCarpet,
  addReview,
  deleteReview,
} = require("../controller/carpetController");
const fileUpload = require("express-fileupload");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public
router.get("/", getAllCarpets);
router.get("/:id", getCarpetById);

// Admin
router.post(
  "/", 
  protect, 
  adminOnly, 
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
  createCarpet
);

router.put(
  "/:id",
  protect,
  adminOnly,
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
  updateCarpet
);
router.delete("/:id", protect, adminOnly, deleteCarpet);

// Reviews
router.post("/:id/reviews", protect, addReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

module.exports = router;
