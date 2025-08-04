const Product = require("../models/Product");
const Receipt = require("../models/Reciepts");

const processSale = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.find({ user: userId }).lean();
    
    const { items } = req.body;



    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    let total = 0;
    const receipts = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found for ID " + item.productId });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      product.quantity -= item.quantity;
      await product.save();

      total += product.sellingPrice * item.quantity;

      const receipt = await Receipt.create({
        productId: product._id,
        quantity: item.quantity,
        type: "sale",
        price: product.sellingPrice,
        userId,
      });

      receipts.push(receipt);
    }

    res.status(200).json({
      success: true,
      total,
      timestamp: new Date(),
      receipts,
    });
  } catch (error) {
    console.error("Error processing sale:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = { processSale };
