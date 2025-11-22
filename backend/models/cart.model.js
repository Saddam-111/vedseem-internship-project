import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "Product", 
     required: true
     },
  name: String,
  price: Number,
  image: String,
  quantity: { 
    type: Number, 
    required: true,
     min: 1 
    },
    customization: {
    text: {
      type: String,
    },
   image: {
      url: String,
      publicId: String,
    },
  },
});

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model('Cart', CartSchema);
export default Cart
