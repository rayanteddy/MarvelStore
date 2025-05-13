const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        size: String,
        color: String,
      },
    ],
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    status: { type: String, default: "In progress" },
    deliveryDate: Date,
    total: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);