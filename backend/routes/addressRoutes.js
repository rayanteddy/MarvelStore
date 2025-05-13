const express = require("express");
const Address = require("../models/AddressModel");

const router = express.Router();

// Add address 
router.post("/", async (req, res) => {
  try {
    const { userId, country, fullName, phoneNumber, address, city, zipCode, province } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const newAddress = new Address({ user: userId, country, fullName, phoneNumber, address, city, zipCode, province });
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ message: "Error adding address", error });
  }
});


// Retrieve all addresses of a user.
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const addresses = await Address.find({ user: userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving addresses", error });
  }
});

// Modify address
router.put("/:id", async (req, res) => {
  try {
    const { userId, ...updateFields } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.user.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to change this address." });
    }

    Object.assign(address, updateFields);
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: "Error Changing Address", error });
  }
});

// Cancel address
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.body.userId; 

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.user.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to delete this address." });
    }

    await address.deleteOne();
    res.json({ message: "Address successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting address", error });
  }
});

module.exports = router;
