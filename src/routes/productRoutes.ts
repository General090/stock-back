import express, { Request, Response } from "express";
import Product from "../models/Product";
import { checkStockLevel } from "../utils/checkStockLevel";

const router = express.Router();

// GET /products/low-stock
router.get("/low-stock", async (req, res) => {
  try {
    const threshold = 5;
    const lowStock = await Product.find({ quantity: { $lt: threshold } });
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch low stock products" });
  }
});

// GET /api/products
router.get("/", async (_req, res) => {
  const products = await Product.find();
  res.json(products);
});



// Get all products
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to get products", error: err });
  }
});

// Add new product
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, quantity, price } = req.body;
    const newProduct = new Product({ name, quantity, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: "Failed to add product", error: err });
  }
});

// Edit product by ID
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err });
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
    res.status(500).json({ message: "Failed to delete product", error: err });
  }
});


router.post("/stock-in", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.quantity += quantity;
    await product.save();

    // ✅ Check stock level after update
    await checkStockLevel(product._id.toString());

    res.status(200).json({ message: "Stock updated", product });
  } catch (err) {
    res.status(500).json({ error: "Stock-in failed" });
  }
});

export default router;
