// 📦 Importations nécessaires
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ✉️ Email service utils
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: '"Marvel Store" <noreply@marvelstore.com>',
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name) => {
  await sendEmail(email, "Welcome to Marvel Store !", `
    <h2>Salut ${name} 👋</h2>
    <p>Thank you for registering on <strong>Marvel Store</strong> !</p>
      <p>Now you can log in and discover lots of products.</p>
      <p>See you soon !</p>
      <p> And don't forget: TREAT YOURSELF !<p/>
      <p>The Marvel Store Team</p>
  `);
};

const sendLoginEmail = async (email, name) => {
  await sendEmail(email, "Connection detected", `
    <h2>Hello ${name},</h2>
    <p>It is very good to see you again in our shop,</p>
    <p>We hope you enjoy our articles.</p>
    <p>We have detected a connection to your Marvel Store account.</p>
    <p>If it wasn't you, change your password immediately or contact us:</p>
    <p>By email: rngasseu@gmail.com or on our number: +39 379 218 2036</p>
  `);
};

const sendUpdateNotification = async (email, name, fieldsChanged) => {
  const list = fieldsChanged.map(f => `<li>${f}</li>`).join("");
  await sendEmail(email, "Modify your account", `
    <h2>Hello ${name},</h2>
    <p>The following information has been changed in your account :</p>
    <ul>${list}</ul>
    <p>If it wasn't you, contact support immediately.</p>
    <p>By email: rngasseu@gmail.com or on our number: +39 379 218 2036</p>
  `);
};

const sendPasswordByEmail = async (email, name, password) => {
  await sendEmail(email, "Password Recovery - Marvel Store", `
    <h2>Hello ${name},</h2>
    <p>Here is your password associated with your account Marvel Store :</p>
    <p><strong>${password}</strong></p>
    <p>We recommend changing it if you think it has been compromised.</p>
    <p>See you soon,<br/>Marvel Store team.</p>
  `);
};


// Route register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, number, recovery } = req.body;
    if (!name || !email || !password || !number || !recovery) {
      return res.status(400).json({ message: "All fields are required !" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use !" });
    }

    const newUser = new User({ name, email, password, number, recovery });
    await newUser.save();

    await sendWelcomeEmail(email, name);

    res.status(201).json({ message: "Successfully registered user !" });
  } catch (err) {
    console.error("Error logging in :", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Route login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required !" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    await sendLoginEmail(user.email, user.name);

    res.status(200).json({ message: "Successful login !", user });
  } catch (err) {
    console.error("Error logging in :", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Route modify
router.put("/user/:email", async (req, res) => {
  try {
    const { name, password, number } = req.body;
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User no found." });

    let fieldsChanged = [];
    if (name && name !== user.name) fieldsChanged.push("Name");
    if (password && password !== user.password) fieldsChanged.push("Passeword");
    if (number && number !== user.number) fieldsChanged.push("Number");

    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email },
      { name, password, number },
      { new: true }
    );

    await sendUpdateNotification(updatedUser.email, updatedUser.name, fieldsChanged);

    res.json({ message: "Modification save", user: updatedUser });
  } catch (err) {
    console.error("Error logging in :", err); 
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Route recovery user
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User no found." });
    }

    res.json(user);
  } catch (err) {
    console.error("Error recovering user :", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔐 Route récupérer password by email
router.post("/forgot-password", async (req, res) => {
  const { email, recovery } = req.body;

  try {
    const user = await User.findOne({ email, recovery });

    if (!user) {
      return res.status(404).json({ message: "User no found" });
    }

    // Send password by mail
    await sendPasswordByEmail(email, user.name, user.password);

    res.json({ message: "Password send to email" });
  } catch (error) {
    console.error("Error sending password :", error);
    res.status(500).json({ message: "Servel erroe" });
  }
});

module.exports = router;
