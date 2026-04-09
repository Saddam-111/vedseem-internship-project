import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"]
    },

    image: {
      url: {
        type: String,
        required: [true, "Product image URL is required"],
      },
      publicId: String,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price cannot exceed 10 lakh"]
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
    },

    subCategory: {
      type: String,
      default: "general",
      lowercase: true,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    isCustomizable: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now }
      }
    ],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ name: 'text', description: 'text' });

productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

const Product = mongoose.model("Product", productSchema);

export default Product;
