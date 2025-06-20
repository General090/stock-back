import express from "express";
import Product from "../models/Product";
import { Transaction } from "../models/Transaction";


const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find();
    const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);
    const lowStock = products.filter((p) => p.quantity < 5).length;

    res.json({ totalProducts, totalQuantity, lowStock });
  } catch (error) {
    res.status(500).json({ message: "Failed to load stats", error });
  }
}); 

// GET /api/dashboard/recent
router.get("/recent", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5); // ✅ Fix here
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error });
  }
});

export default router;
