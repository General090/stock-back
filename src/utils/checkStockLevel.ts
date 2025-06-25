import Product, { ProductDocument } from "../models/Product";
import { sendNotification } from "./sendNotification";

export const checkStockLevel = async (productId: string) => {
  try {
    const product = await Product.findById(productId).lean<ProductDocument>();
    
    if (!product) {
      console.error(`Product ${productId} not found`);
      return;
    }

    // Use remainingQuantity instead of quantity to match your model
    if (product.remainingQuantity < product.minThreshold) {
      await sendNotification(
        `${product.name} is LOW in stock! (${product.remainingQuantity})`
      );
    }

    if (product.maxThreshold && product.remainingQuantity > product.maxThreshold) {
      await sendNotification(
        `${product.name} is OVERSTOCKED! (${product.remainingQuantity})`
      );
    }
  } catch (error) {
    console.error("Error checking stock level:", error);
  }
};