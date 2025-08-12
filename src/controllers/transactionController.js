const Transaction = require("../models/Transaction");

const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }) // ✅ filter by logged-in user
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product", "name sellingPrice remainingQuantity");

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Failed to fetch transactions:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch recent transactions" });
  }
};



module.exports = { getRecentTransactions };
