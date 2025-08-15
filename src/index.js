const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const productRoutes = require("./routes/productRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/reportRoutes");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "https://stock-front-smoky.vercel.app" }));
// app.use(cors({ origin: "https://localhost:5000" }));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);


app.get("/", (_req, res) => {
  res.send("API is running...");
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment variables.");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));
