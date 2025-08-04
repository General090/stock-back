const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const {getRecentTransactions} = require('../controllers/transactionController')
const Product = require('../models/Product');


router.get("/recent", getRecentTransactions); // <--- This is the key


router.post('/', async (req, res) => {
  try {
    const { product, type, quantity } = req.body;

    // Validate input
    if (!product || !type || typeof quantity !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields or invalid quantity',
      });
    }

    const prod = await Product.findById(product);
    if (!prod) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Check stock level
    if (type === 'OUT' && prod.remainingQuantity < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock',
        available: prod.remainingQuantity,
      });
    }

    // Update inventory
    prod.remainingQuantity += type === 'IN' ? quantity : -quantity;
    await prod.save();

    // Create transaction
    const transaction = new Transaction({
      product,
      type,
      quantity,
      price: type === 'IN' ? prod.costPrice : prod.sellingPrice,
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
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Transaction error:', errorMessage);
    res.status(500).json({
      success: false,
      error: 'Transaction failed',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const recent = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name sellingPrice remainingQuantity');

    return res.json({
      success: true,
      data: recent,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to fetch transactions:', errorMessage);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

module.exports = router;
