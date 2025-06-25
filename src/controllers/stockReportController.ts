import { Request, Response } from "express";
import Product, { ProductDocument } from "../models/Product";

interface StockItem {
  name: string;
  initialQuantity: number;
  remainingQuantity: number;
  costPrice: number;
  sellingPrice: number;
  minThreshold: number;
  maxThreshold: number;
  soldQuantity: number;
  totalCostValue: number;
  totalSalesValue: number;
  profit: number;
  category?: string;
}

export const getStockSummary = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().lean<ProductDocument[]>();
    
    const report: StockItem[] = products.map(product => ({
      name: product.name,
      initialQuantity: product.initialQuantity,
      remainingQuantity: product.remainingQuantity,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      minThreshold: product.minThreshold,
      maxThreshold: product.maxThreshold,
      soldQuantity: product.soldQuantity,
      totalCostValue: product.costPrice * product.remainingQuantity,
      totalSalesValue: product.sellingPrice * product.soldQuantity,
      profit: (product.sellingPrice - product.costPrice) * product.soldQuantity,
      category: product.category
    }));

    const summary = {
      totalItems: products.length,
      totalStockValue: report.reduce((sum, item) => sum + item.totalCostValue, 0),
      totalSalesValue: report.reduce((sum, item) => sum + item.totalSalesValue, 0),
      totalProfit: report.reduce((sum, item) => sum + item.profit, 0),
      lowStockItems: report.filter(item => 
        item.remainingQuantity < item.minThreshold
      ),
      outOfStockItems: report.filter(item => item.remainingQuantity === 0),
      healthyStockItems: report.filter(item => 
        item.remainingQuantity >= item.minThreshold
      )
    };

    res.json({
      success: true,
      data: report,
      summary
    });
    
  } catch (err: unknown) {
    console.error("Error in stock summary:", err);
    
    // Type-safe error handling
    const errorMessage = err instanceof Error 
      ? err.message 
      : "An unknown error occurred";
      
    res.status(500).json({ 
      success: false,
      error: "Failed to generate stock summary",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};