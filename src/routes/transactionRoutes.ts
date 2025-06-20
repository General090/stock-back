import { Router, Request, Response, NextFunction } from 'express';
import { Transaction } from "../models/Transaction";

import Product from "../models/Product";


const router: Router = Router();
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product, type, quantity } = req.body;

    const prod = await Product.findById(product);
    if (!prod) return res.status(404).json({ message: "Product not found" });

    if (type === "OUT" && prod.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    prod.quantity += type === "IN" ? quantity : -quantity;
    await prod.save();

    const transaction = new Transaction(req.body);
    await transaction.save();

    return res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

router.get("/recent", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recent = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product");
    return res.json(recent);
  } catch (err) {
    next(err);
  }
});

export default router;
