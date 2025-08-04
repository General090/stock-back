// controllers/dashboardController.js
const Product = require("../models/Product");
const { Transaction } = require("../models/Transaction");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.find({ user: userId }).lean();

    const totalProducts = products.length;

    const totalQuantity = products.reduce(
      (sum, p) => sum + (p.remainingQuantity ?? p.quantity ?? 0),
      0
    );

    const threshold = 5;
    const lowStockItems = products.filter(
      p => (p.remainingQuantity ?? p.quantity ?? 0) < (p.minThreshold ?? threshold)
    );

    res.json({
      success: true,
      data: {
        totalProducts,
        totalQuantity,
        lowStock: lowStockItems.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name sellingPrice');

    res.json({
      success: true,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentTransactions
};
