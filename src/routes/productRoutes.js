const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { checkStockLevel } = require("../utils/checkStockLevel");
const User = require("../models/User");
const { createProduct, getProductsByUser, getLowStockProducts } = require("../controllers/productController");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authMiddleware")



router.get("/my-products", authenticate, getProductsByUser);
router.post("/", authenticate, createProduct);

// GET /products/low-stock
// GET /products/low-stock
router.get("/low-stock", authenticate, getLowStockProducts)


// router.post("/", authenticate, createProduct, async (req, res) => {
//   const userId = req.user._id;

//   try {
//     const { 
//       name, 
//       initialQuantity, 
//       costPrice, 
//       sellingPrice, 
//       minThreshold = 5, 
//       maxThreshold = 100, 
//       category = "General",
//     } = req.body;

//     if (!name || initialQuantity === undefined || costPrice === undefined || sellingPrice === undefined) {
//       return res.status(400).json({ 
//         message: "Missing required fields: name, initialQuantity, costPrice, sellingPrice" 
//       });
//     }

//     const newProduct = new Product({ 
//       name, 
//       initialQuantity,
//       remainingQuantity: initialQuantity,
//       costPrice,
//       sellingPrice,
//       minThreshold,
//       maxThreshold,
//       category,
//       user: userId
//     });
    
//     await newProduct.save();
//     res.status(201).json({
//       success: true,
//       data: newProduct
//     });
//   } catch (err) {
//     console.error("Error creating product:", err);
//     const errorMessage = err instanceof Error ? err.message : "Unknown error";
//     res.status(500).json({ 
//       success: false,
//       message: "Failed to add product", 
//       error: errorMessage 
//     });
//   }
// });



// Get all products
router.get("/", authenticate, async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
});

// Edit product by ID
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true
    });
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ message: "Failed to update product", error: errorMessage });
  }
});

// Delete product by ID
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ message: "Failed to delete product", error: errorMessage });
  }
});

// Stock in operation
router.post("/stock-in", authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.remainingQuantity += quantity;
    if (product.initialQuantity < product.remainingQuantity) {
      product.initialQuantity = product.remainingQuantity;
    }
    
    await product.save();

    const userId = req.user._id;
    const products = await Product.find({ user: userId });
    for (const product of products) {
      await checkStockLevel(product._id.toString());
    }
 
    res.status(200).json({ message: "Stock updated", product });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Stock-in failed", details: errorMessage });
  }
});

module.exports = router;
