const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// GET /api/orders/:userId — View a user's orders
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error Retrieving Orders :", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/orders/reorder — Reordering
router.post("/reorder", async (req, res) => {
  const { orderId, userId } = req.body;

  try {
    const originalOrder = await Order.findById(orderId);
    if (!originalOrder) return res.status(404).json({ message: "Order no found" });

    const newOrder = new Order({
      userId,
      items: originalOrder.items,
      address: originalOrder.address,
      status: "In progress",
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 3 days later
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Order ironing error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/orders/create — Create an order after payment.
router.post("/create", async (req, res) => {
    const { userId, items, address } = req.body;
  
    try {
      let total = 0;
  
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Invalid product: ${item.productId}` });
        }
        total += product.price * item.quantity;
      }
  
      const order = new Order({
        userId,
        items,
        address,
        status: "In progress",
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        total: parseFloat(total.toFixed(2)),
      });
  
      await order.save();
      res.status(201).json(order);
  
    } catch (err) {
      console.error("Command creation error :", err);
      res.status(500).json({ message: "Error creating the order." });
    }
  });

  router.post("/create-payment-intent", async (req, res) => {
    const { amount } = req.body;
  
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
    });
  
    res.send({ clientSecret: paymentIntent.client_secret });
  });
  
  // Create order
router.post("/create", async (req, res) => {
    const { userId, cart, address, paymentMethod, total } = req.body;
  
    if (!userId || !cart || !address || !paymentMethod || !total) {
      return res.status(400).json({ message: "Incomplete order data" });
    }
  
    try {
      const newOrder = new Order({
        userId,
        products: cart.products.map(p => ({
          productId: p.productId._id || p.productId,
          quantity: p.quantity,
          color: p.color,
          size: p.size
        })),
        shippingAddress: address,
        paymentMethod,
        total,
        status: "Paid",
        date: new Date()
      });
  
      await newOrder.save();
      res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (err) {
      console.error("Command creation error :", err);
      res.status(500).json({ message: "Server error creating the order." });
    }
  });
  
  // Cancel order
router.delete("/:orderId", async (req, res) => {
    try {
      const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);
      if (!deletedOrder) {
        return res.status(404).json({ message: "Order no found" });
      }
      res.json({ message: "Order successfully cancelled" });
    } catch (error) {
      console.error("Order Cancellation Error :", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;
