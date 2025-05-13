const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connect"))
.catch(err => console.error("❌ Error MongoDB:", err));

// Import Routes
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes"); 
const addressRoutes = require("./routes/addressRoutes"); 
const stripeRoute = require("./routes/stripe");
const adminRoutes = require("./routes/AdminRoutes");

// Using routes
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes); 
app.use("/api/addresses", addressRoutes);
app.use("/api/stripe", stripeRoute);
app.use("/api/admin", adminRoutes); 


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
