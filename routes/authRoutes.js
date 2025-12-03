const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect,adminOnly } = require("../middleware/authMiddleware");
const { signup, login, getProfile, updateProfile,getAllUsersExceptAdmins,
  forgotPassword,resetPassword
 } = require("../controller/authController");

router.post("/signup", signup);
router.post("/login", login);

// profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("photo"), updateProfile);
router.get(
  "/all",
  protect,
  adminOnly,
 getAllUsersExceptAdmins
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


module.exports = router;
