const Product = require("../models/Product");
const { sendNotification } = require("./sendNotification");

const checkStockLevel = async (productId) => {
  try {
    const product = await Product.findById(productId).lean();

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

    if (
      product.maxThreshold &&
      product.remainingQuantity > product.maxThreshold
    ) {
      await sendNotification(
        `${product.name} is OVERSTOCKED! (${product.remainingQuantity})`
      );
    }
  } catch (error) {
    console.error("Error checking stock level:", error);
  }
};

module.exports = { checkStockLevel };
