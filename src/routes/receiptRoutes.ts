import express from "express";
import Receipt from "../models/Reciepts";
import Product from "../models/Product";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { productId, quantity, type } = req.body;

    if (!productId || !quantity || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const receipt = await Receipt.create({
      productId,
      quantity,
      type,
      price: product.sellingPrice,
    });

    res.status(201).json({ 
      success: true,
      receipt,
      product: {
        name: product.name,
        sellingPrice: product.sellingPrice,
        remainingQuantity: product.remainingQuantity
      }
    });
  } catch (error: unknown) {
    // Type-safe error handling
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unknown error occurred";

    console.error("Failed to create receipt:", errorMessage);
    
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

export default router;