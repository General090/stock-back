import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ["sale", "return"], required: true },
  price: { type: Number, required: true }, 
}, { timestamps: true });

const Receipt = mongoose.model("Receipt", receiptSchema);
export default Receipt;
