const express = require("express");
const User = require("../models/User");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Address = require("../models/AddressModel");

const router = express.Router();

// GET /api/admin/users - Recover all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error: Unable to recover users." });
  }
});

// GET /api/admin/orders - Retrieve all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error: Unable to retrieve orders.." });
  }
});

// GET /api/admin/carts - Collect all trolleys
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: "Server error: Unable to recover carts." });
  }
});

// GET /api/admin/addresses - Retrieve all addresses
router.get("/addresses", async (req, res) => {
  try {
    const addresses = await Address.find({});
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Server error: Unable to retrieve addresses." });
  }
});

// DELETE /api/admin/user/:id - Delete user
router.delete("/user/:id", async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User delet" });
    } catch (err) {
      res.status(500).json({ message: "User Deletion Error" });
    }
  });
  
  // DELETE /api/admin/order/:id - Delete order
  router.delete("/order/:id", async (req, res) => {
    try {
      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: "Order delete" });
    } catch (err) {
      res.status(500).json({ message: "Order deletion error" });
    }
  });
  
  // DELETE /api/admin/cart/:id - Delete cart
  router.delete("/cart/:id", async (req, res) => {
    try {
      await Cart.findByIdAndDelete(req.params.id);
      res.json({ message: "Cart delete" });
    } catch (err) {
      res.status(500).json({ message: "Cart delection error" });
    }
  });
  
  // DELETE /api/admin/address/:id - Delete Address
  router.delete("/address/:id", async (req, res) => {
    try {
      await Address.findByIdAndDelete(req.params.id);
      res.json({ message: "Address delete" });
    } catch (err) {
      res.status(500).json({ message: "Address delection error" });
    }
  });
  
  // PUT /api/admin/user/:id - Modify user
router.put("/user/:id", async (req, res) => {
    const { name, email } = req.body;
    
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { name, email },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User no found." });
      }
  
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "User Update Error" });
    }
});

// PUT /api/admin/order/:id/status - Modify order
router.put("/order/:id/status", async (req, res) => {
    const { status } = req.body;
  
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order no found." });
      }
  
      res.json(updatedOrder);
    } catch (err) {
      res.status(500).json({ message: "Order update error" });
    }
});

// PUT /api/admin/cart/:id - Modify cart
router.put("/cart/:id", async (req, res) => {
    try {
      const { products } = req.body;
  
      const updatedCart = await Cart.findByIdAndUpdate(
        req.params.id,
        { products },
        { new: true }
      );
  
      if (!updatedCart) {
        return res.status(404).json({ message: "Cart no found." });
      }
  
      res.json({ message: "Cart update", cart: updatedCart });
    } catch (error) {
      console.error("❌ Error MAJ cart :", error);
      res.status(500).json({ message: "Server error when updating basket." });
    }
});
  
// PUT /api/admin/address/:id - Modify address
router.put("/address/:id", async (req, res) => {
    try {
        const { address, city, zipCode, country } = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(
        req.params.id,
        { address, city, zipCode, country },
        { new: true }
        );

        if (!updatedAddress) {
        return res.status(404).json({ message: "Address no found." });
        }

        res.json({ message: "Address update", address: updatedAddress });
    } catch (error) {
        console.error("❌ Error MAJ address :", error);
        res.status(500).json({ message: "Server error updating address." });
    }
});  
  

module.exports = router;
