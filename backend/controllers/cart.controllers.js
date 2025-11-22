import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import mongoose from "mongoose";
import { uploadCloudinary } from "../config/cloudinary.js";

// Helper to calculate subtotals
const getDetailedCart = async (items) => {
  return items.map((item) => ({
    ...item.toObject(),
    subtotal: item.price * item.quantity,
  }));
};

// ✅ Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, customText } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ message: "Invalid productId" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const hasCustomization = customText || req.file;
    let customizationData = {};

    if (customText) {
      customizationData.text = customText;
    }

    if (req.file) {
      const imageUploadResponse = await uploadCloudinary(req.file.path, "cart_items");
      if (!imageUploadResponse) {
        return res.status(500).json({ message: "Custom image upload failed" });
      }
      customizationData.image = {
        url: imageUploadResponse.secure_url,
        publicId: imageUploadResponse.public_id,
      };
    }

    let existingItem;
    if (hasCustomization) {
      // Customized items are always treated as new unique items
      existingItem = null;
    } else {
      // For non-customized items, find one that matches the product ID
      // AND does not have a customization field.
      existingItem = cart.items.find(
        (item) => item.product.equals(productId) && !item.customization
      );
    }

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      const newItem = {
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image?.url || "",
        quantity: Number(quantity),
      };
      if (hasCustomization) {
        newItem.customization = customizationData;
      }
      cart.items.push(newItem);
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product');
    return res.status(201).json({ cart: await getDetailedCart(populatedCart.items) });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Add to cart error" });
  }
};


// ✅ Update quantity (MODIFIED to use cartItemId)
export const updateCart = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(cartItemId); // Use Mongoose's .id() to find subdocument
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      cart.items.pull({ _id: cartItemId }); // Use .pull() to remove subdocument
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product');
    return res.status(200).json({ cart: await getDetailedCart(populatedCart.items) });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({ message: "Update cart error" });
  }
};

// ✅ Remove product (MODIFIED to use cartItemId)
export const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items.pull({ _id: cartItemId }); // Use .pull() to remove subdocument by its unique ID

    await cart.save();
    const populatedCart = await cart.populate('items.product');
    return res.status(200).json({ cart: await getDetailedCart(populatedCart.items) });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ message: "Remove from cart error" });
  }
};

// ✅ Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    return res.status(200).json({ cart: [] });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ message: "Clear cart error" });
  }
};

// ✅ Get full cart
export const getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    if (!cart) return res.status(200).json({ cart: [] });

    return res.status(200).json({ cart: await getDetailedCart(cart.items) });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ message: "Get cart error" });
  }
};