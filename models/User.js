const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["Admin", "User"], required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  mobile: { type: String, default: "" },
  addresses: [
    {
      type: String,
      trim: true,
    },
  ],
  upiIds: [
    {
      type: String,
      trim: true,
    },
  ],
  resetPasswordToken: String,
resetPasswordExpire: Date,

  photo: { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);
