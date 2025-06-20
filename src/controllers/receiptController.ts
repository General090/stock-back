import Product from "../models/Product.js";

export const processSale = async (req, res) => {
  const { items } = req.body;

  let total = 0;
  for (let item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.quantity < item.quantity) {
      return res.status(400).send("Insufficient stock");
    }

    product.quantity -= item.quantity;
    await product.save();

    total += product.price * item.quantity;
  }

  res.json({ success: true, total, timestamp: new Date() });
};
  