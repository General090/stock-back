import express, { Request, Response } from "express";
import Product, { ProductDocument } from "../models/Product";
import { checkStockLevel } from "../utils/checkStockLevel";

const router = express.Router();

// GET /products/low-stock
router.get("/low-stock", async (req: Request, res: Response) => {
  try {
    const threshold = req.query.threshold || 5;
    const lowStock = await Product.find({
      $or: [
        { remainingQuantity: { $lt: threshold } },
        { quantity: { $lt: threshold } }
      ]
    }).lean();
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});


router.post("/", async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      initialQuantity, 
      costPrice, 
      sellingPrice, 
      minThreshold = 5, 
      maxThreshold = 100, 
      category = "General" 
    } = req.body;

    // Validate required fields
    if (!name || initialQuantity === undefined || costPrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields: name, initialQuantity, costPrice, sellingPrice" 
      });
    }

    const newProduct = new Product({ 
      name, 
      initialQuantity,
      remainingQuantity: initialQuantity, // Set equal to initial quantity
      costPrice,
      sellingPrice,
      minThreshold,
      maxThreshold,
      category
    });
    
    await newProduct.save();
    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (err) {
    console.error("Error creating product:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ 
      success: false,
      message: "Failed to add product", 
      error: errorMessage 
    });
  }
});

// Get all products
router.get("/", async (req: Request, res: Response) => {
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
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true // Ensures updates follow schema validation
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
router.delete("/:id", async (req: Request, res: Response) => {
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
router.post("/stock-in", async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.remainingQuantity += quantity;
    if (product.initialQuantity < product.remainingQuantity) {
      product.initialQuantity = product.remainingQuantity;
    }
    
    await product.save();
    await checkStockLevel(product._id.toString());
    
    res.status(200).json({ message: "Stock updated", product });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Stock-in failed", details: errorMessage });
  }
});

export default router;