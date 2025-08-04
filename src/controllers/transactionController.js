const Transaction = require("../models/Transaction");

const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch recent transactions" });
  }
};

module.exports = { getRecentTransactions };
