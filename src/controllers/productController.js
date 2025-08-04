const Product = require("../models/Product");

// Create Product
const createProduct = async (req, res) => {
  const userId = req.user.id;

  try {
    const {
      name,
      costPrice,
      sellingPrice,
      initialQuantity,
      remainingQuantity,
      minThreshold,
      maxThreshold,
      category,
    } = req.body;


    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const newProduct = new Product({
      name,
      costPrice,
      sellingPrice,
      initialQuantity,
      remainingQuantity,
      minThreshold,
      maxThreshold,
      category,
      user: userId,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Products by User
const getProductsByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ success: false, message: "Missing userId" });

    const products = await Product.find({ user: userId });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user's products" });
  }
};


module.exports = {
  createProduct,
  getProductsByUser,
};
