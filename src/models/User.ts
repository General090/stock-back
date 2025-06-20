import mongoose, { Document, Model } from "mongoose";

// 1. Define an interface representing a User document in MongoDB
interface IUser extends Document {
  name: string;
  email: string;
  password: string;  // hashed password
}

// 2. Create the schema with proper types
const userSchema = new mongoose.Schema<IUser>({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// 3. Create the model with interface type
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
