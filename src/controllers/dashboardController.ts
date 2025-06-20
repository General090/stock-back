import Product from "../models/Product";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalQuantity = await Product.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);

    const lowStockThreshold = 5;
    const lowStock = await Product.countDocuments({ quantity: { $lt: lowStockThreshold } });

    res.json({
      totalProducts,
      totalQuantity: totalQuantity[0]?.total || 0,
      lowStock,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
