const Product = require("../models/Product");

const getStockSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const products = await Product.find({ user: userId }).lean();

    const report = products.map(product => ({
      name: product.name,
      initialQuantity: product.initialQuantity,
      remainingQuantity: product.remainingQuantity,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      minThreshold: product.minThreshold,
      maxThreshold: product.maxThreshold,
      soldQuantity: product.soldQuantity,
      totalCostValue: product.costPrice * product.remainingQuantity,
      totalSalesValue: product.sellingPrice * product.soldQuantity,
      profit: (product.sellingPrice - product.costPrice) * product.soldQuantity,
      category: product.category
    }));

    const summary = {
      totalItems: products.length,
      totalStockValue: report.reduce((sum, item) => sum + item.totalCostValue, 0),
      totalSalesValue: report.reduce((sum, item) => sum + item.totalSalesValue, 0),
      totalProfit: report.reduce((sum, item) => sum + item.profit, 0),
      lowStockItems: report.filter(item => item.remainingQuantity < item.minThreshold),
      outOfStockItems: report.filter(item => item.remainingQuantity === 0),
      healthyStockItems: report.filter(item => item.remainingQuantity >= item.minThreshold)
    };

    res.json({
      success: true,
      data: report,
      summary
    });

  } catch (err) {
    console.error("Error in stock summary:", err);
    
    res.status(500).json({
      success: false,
      error: "Failed to generate stock summary",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = { getStockSummary };
