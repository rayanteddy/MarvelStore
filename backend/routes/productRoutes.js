const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); 
const multer = require("multer");

// Multer configuration for uploading images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });


// Route to collect all products
router.get("/", async (req, res) => {
  try {
    console.log("Request received to retrieve products.");
    const products = await Product.find();
    console.log("Products Found :", products);
    res.json(products);
  } catch (err) {
    console.error("Server error :", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to add a product
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, sizes, colors, stock } = req.body;

    console.log("Data received :", req.body);
    console.log("File received :", req.file);

    if (!name || !price || !description || !category || !sizes || !colors || !stock || !req.file) {
      return res.status(400).json({ message: "All fields are required. !" });
    }

    // Check that sizes and colours are indeed paintings.
    const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
    const colorArray = Array.isArray(colors) ? colors : [colors];

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      sizes: sizeArray,
      colors: colorArray,
      stock,
      image: `/uploads/${req.file.filename}`, 
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully.!" });
  } catch (error) {
    console.error("Server error :", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;
