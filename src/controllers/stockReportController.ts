import { Request, Response } from "express";
import Product from "../models/Product";
import { Transaction } from "../models/Transaction"; // adjust path


interface TransactionTrend {
  date: string;
  totalTransactions: number;
  totalQuantity: number;
}



export const getStockSummary = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({});
    const summary = {
      totalItems: products.length,
      totalStock: products.reduce((acc, p) => acc + p.quantity, 0),
      lowStock: products
        .filter(p => p.quantity < 10)
        .map(p => ({
          name: p.name,
          quantity: p.quantity,
        })),
    };
    res.json(summary);
  } catch (err) {
    console.error("Stock Summary Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
