const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

// Retrieve a user's shopping cart.
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate("products.productId");
    res.json(cart || { userId: req.params.userId, products: [] });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart" });
  }
});

// Add product to cart
router.post("/add", async (req, res) => {
  const { userId, productId, color, size, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const existingProduct = cart.products.find(
      (p) => p.productId.toString() === productId && p.color === color && p.size === size
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ productId, color, size, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Error add cart :", err);
    res.status(500).json({ error: "Error adding to basket" });
  }
});

// Delete a product with a specific size/colour
router.post("/remove", async (req, res) => {
  const { userId, productId, color, size } = req.body;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart no found" });

    cart.products = cart.products.filter(
      (p) => !(p.productId.equals(productId) && p.color === color && p.size === size)
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Update stock after payment.
router.post("/updateStock", async (req, res) => {
  const { cart } = req.body;

  if (!cart || !Array.isArray(cart.products)) {
    return res.status(400).json({ message: "Invalid cart data" });
  }

  try {
    for (const item of cart.products) {
      const product = await Product.findById(item.productId._id || item.productId);

      if (!product) {
        console.warn(`Invalid product : ${item.productId}`);
        continue;
      }

      product.stock = product.stock - item.quantity;
      if (product.stock < 0) product.stock = 0;

      await product.save();
    }

    res.status(200).json({ message: "Stock successfully updated." });
  } catch (err) {
    console.error("Error updateStock :", err);
    res.status(500).json({ message: "Error updating stock" });
  }
});

// Empty a user's shopping cart.
router.post("/clear", async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Invalid cart" });

    cart.products = [];
    await cart.save();

    res.json({ message: "Basket emptied successfully" });
  } catch (error) {
    console.error("Error emptying cart :", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
