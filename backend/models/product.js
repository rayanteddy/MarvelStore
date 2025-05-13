const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  sizes: { type: [String], required: true },
  colors: { type: [String], required: true },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, required: true },
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
