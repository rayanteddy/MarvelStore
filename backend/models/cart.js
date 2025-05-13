const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      color: String,
      size: String,
      quantity: {
        type: Number,
        default: 1
      }
    }
  ]
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
