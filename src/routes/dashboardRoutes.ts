import express from "express";
import Product from "../models/Product";
import { Transaction } from "../models/Transaction";

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const threshold = 5;
    const products = await Product.find().lean();
    
    const lowStockItems = products.filter(p => 
      (p.remainingQuantity ?? p.quantity ?? 0) < (p.minThreshold ?? threshold)
    );

    const totalQuantity = products.reduce(
      (sum, p) => sum + (p.remainingQuantity ?? p.quantity ?? 0), 
      0
    );

    res.json({ 
      success: true,
      data: {
        totalProducts: products.length,
        totalQuantity,
        lowStock: lowStockItems.length // Now properly getting length of array
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      success: false,
      message: "Failed to load stats",
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// GET /api/dashboard/recent
router.get("/recent", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name sellingPrice');

    res.json({
      success: true,
      data: transactions
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

export default router;