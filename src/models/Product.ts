import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  minThreshold: { type: Number, default: 10 }, // Low stock warning
  maxThreshold: { type: Number, default: 100 }, // Overstock warning
  category: String,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
