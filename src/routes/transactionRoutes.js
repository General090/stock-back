const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { getRecentTransactions } = require('../controllers/transactionController')
const Product = require('../models/Product');
const authenticate =require('../middleware/authMiddleware')


// router.get("/recent", getRecentTransactions); // <--- This is the key


router.post('/', authenticate, async (req, res) => {
  try {
    const { product, type, quantity } = req.body;
    const userId = req.user.id; // ✅ Get from token/session

    if (!product || !type || typeof quantity !== 'number') {
      return res.status(400).json({ success: false, error: 'Missing required fields or invalid quantity' });
    }

    const prod = await Product.findOne({ _id: product, user: userId }); // ✅ Ensure this product belongs to the user
    if (!prod) {
      return res.status(404).json({ success: false, error: 'Product not found for this user' });
    }

    if (type === 'OUT' && prod.remainingQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        available: prod.remainingQuantity,
      });
    }

    prod.remainingQuantity += type === 'IN' ? quantity : -quantity;
    await prod.save();

    const transaction = new Transaction({
      product,
      type,
      quantity,
      price: type === 'IN' ? prod.costPrice : prod.sellingPrice,
      user: userId // ✅ Store the user
    });

    await transaction.save();

    return res.status(201).json({
      success: true,
      data: {
        transaction,
        newStock: prod.remainingQuantity,
      },
    });
  } catch (err) {
    console.error('Transaction error:', err.message);
    res.status(500).json({ success: false, error: 'Transaction failed' });
  }
});


router.get('/recent', authenticate, getRecentTransactions)


module.exports = router;
