import Product from "../models/Product";
import { sendNotification } from "./sendNotification";

export const checkStockLevel = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) return;

  if (product.quantity < product.minThreshold) {
    await sendNotification(`${product.name} is LOW in stock! (${product.quantity})`);
  }

  if (product.maxThreshold && product.quantity > product.maxThreshold) {
    await sendNotification(`${product.name} is OVERSTOCKED! (${product.quantity})`);
  }
};
