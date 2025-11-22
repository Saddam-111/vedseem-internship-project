import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
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
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "gifts",
        "toys",
        "flowers",
        "tablelamp",
        "watch",
        "icecream",
        "personalized-gifts",
        "electronics-gadgets",
        "fashion-accessories",
        "home-decor",
        "food-beverages",
        "gifts-for-men",
        "gifts-for-women",
        "toys-games",
        "wellness-selfcare",
        "rakhi-specials",
        "gifts-for-kids",
        "all-gifts",
        "same-day-delivery",
        "trending-drinkware",
      ],
      lowercase: true,
      trim: true,
    },

    subCategory: {
      type: String,
      enum: [
        "birthday",
        "anniversary",
        "congratulation",
        "thanks",
        "personalized-gifts",
        "electronics-gadgets",
        "fashion-accessories",
        "home-decor",
        "food-beverages",
        "toys-games",
        "wellness-selfcare",
        "general",
      ],
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

// ⭐ Add average rating + number of reviews
rating: {
  type: Number,
  default: 0,
},
numReviews: {
  type: Number,
  default: 0,
},
  stock: {
  type: Number,
  required: true,
  min: [0, "Stock cannot be negative"],
  default: 0,
},
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
