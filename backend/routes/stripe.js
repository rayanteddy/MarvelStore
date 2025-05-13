const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/create-checkout-session", async (req, res) => {
    const { cart, userEmail } = req.body;
  
    console.log("RECEIVED ON THE BACKEND SIDE :", req.body);

    cart.products.forEach(item => {
        console.log("Unit price check :", item.productId.name, item.productId.price, typeof item.productId.price);
        console.log("Product Detail Received :", item);
      }); 
      
    const line_items = cart.products.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.productId.name,
        },
        unit_amount: Math.round(parseFloat(item.productId.price * 100)),
      },
      quantity: item.quantity,
    }));
  
    console.log("PRODUCTS FOR STRIPE :", line_items);  

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card",  "revolut_pay"],
      line_items,
      mode: "payment",
      customer_email: userEmail,
      success_url: "http://localhost:3000/success?email=" + userEmail,
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session creation error :", err);
    res.status(500).json({ error: "Stripe error" });
  }
});

router.post("/send-confirmation", async (req, res) => {
  const { toEmail } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }      
    });

    await transporter.sendMail({
      from: '"Your market " <Marvel Store>',
      to: toEmail,
      subject: "Order Confirmation",
      html: `<h2>Thank you for your purchase. !</h2><p>Your order is being processed. Delivery expected within 2 days.</p>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email sending error :", err);
    res.status(500).json({ error: "Email sending error" });
  }
});

module.exports = router;
