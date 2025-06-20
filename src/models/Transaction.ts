import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ["in", "out"], required: true },
  date: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
