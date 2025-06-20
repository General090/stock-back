import express from "express";
import Receipt from "../models/Reciepts";
import Product from "../models/Product"; // ✅ Import this

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { productId, quantity, type } = req.body;

    if (!productId || !quantity || !type) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const receipt = await Receipt.create({
      productId,
      quantity,
      type,
      price: product.price,
    });

    res.status(201).json({ receipt, product });
  } catch (error) {
    console.error("Failed to save receipt:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
