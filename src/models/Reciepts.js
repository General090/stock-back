const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ["sale", "return"], required: true },
    price: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
