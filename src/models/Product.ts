import { Schema, model, Document, Types } from 'mongoose';

interface IProduct {
  name: string;
  quantity?: number; // Add this if you need quantity field
  initialQuantity: number;
  remainingQuantity: number;
  costPrice: number;
  sellingPrice: number;
  minThreshold: number;
  maxThreshold: number;
  category?: string;
}

interface ProductDocument extends IProduct, Document {
  _id: Types.ObjectId; // Properly type the _id field
  soldQuantity: number;
  // Add other virtuals/document methods here if needed
}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  // Add quantity if needed:
  quantity: { type: Number }, 
  initialQuantity: { type: Number, required: true },
  remainingQuantity: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  minThreshold: { type: Number, required: true },
  maxThreshold: { type: Number, required: true },
  category: { type: String }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('soldQuantity').get(function(this: ProductDocument) {
  return this.initialQuantity - this.remainingQuantity;
});

const Product = model<ProductDocument>("Product", productSchema);

export default Product;
export { IProduct, ProductDocument };