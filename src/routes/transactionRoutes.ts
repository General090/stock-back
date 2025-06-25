import { Router, Request, Response, NextFunction } from 'express';
import { Transaction } from "../models/Transaction";
import Product, { ProductDocument } from "../models/Product";

const router: Router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product, type, quantity } = req.body;

    // Validate input
    if (!product || !type || typeof quantity !== 'number') {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields or invalid quantity" 
      });
    }

    const prod = await Product.findById(product);
    if (!prod) {
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }

    // Use remainingQuantity instead of quantity
    if (type === "OUT" && prod.remainingQuantity < quantity) {
      return res.status(400).json({ 
        success: false,
        error: "Insufficient stock",
        available: prod.remainingQuantity
      });
    }

    // Update inventory
    prod.remainingQuantity += type === "IN" ? quantity : -quantity;
    await prod.save();

    // Create transaction
    const transaction = new Transaction({
      product,
      type,
      quantity,
      price: type === "IN" ? prod.costPrice : prod.sellingPrice
    });
    await transaction.save();

    return res.status(201).json({
      success: true,
      data: {
        transaction,
        newStock: prod.remainingQuantity
      }
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Transaction error:", errorMessage);
    res.status(500).json({
      success: false,
      error: "Transaction failed",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

router.get("/recent", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recent = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product", "name sellingPrice remainingQuantity");

    return res.json({
      success: true,
      data: recent
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to fetch transactions:", errorMessage);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

export default router;