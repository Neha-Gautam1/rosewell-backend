// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        carpet: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Carpet",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentId: String,
    razorpayOrderId: String,
    signature: String,
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    // Expanded status set for delivery flow
    status: {
      type: String,
      enum: [
        "Processing",        // order placed, not yet picked
        "Picked Up",         // delivery boy picked up from vendor
        "Out for Delivery",  // on the way to customer
        "Delivered",         // delivered successfully
        "Failed/Returned",   // unable to deliver, returned or failed
        "Cancelled"
      ],
      default: "Processing",
    },
    address: {
      type: String,
      required: true,
    },
    // OPTIONAL: store lat/lng if you want map routing from backend
    // location: {
    //   lat: Number,
    //   lng: Number
    // },
    upiId: {
      type: String,
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
   trackingId: {
  type: String,
  required: true,
  unique: true,
}
,
    // delivery time slot / ETA (optional)
    deliveryTime: {
      type: Date,
      default: null,
    },
    // number of attempts made to deliver
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
    // array of proof objects { url, uploadedAt, type }
    deliveryProof: [
      {
        url: String,
        uploadedAt: { type: Date, default: Date.now },
        type: { type: String, enum: ["photo", "signature", "other"], default: "photo" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
