// controllers/product.controllers.js
import { uploadCloudinary, deleteCloudinary } from '../config/cloudinary.js';
import Product from '../models/product.model.js';

/**
 * Helper to convert strings "true"/"false" (from form data) to boolean
 */
const parseBoolean = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true' || val === '1';
  }
  return false;
};

// Add new product
export const addProduct = async (req, res) => {
  try {
    // read isCustomizable (note: formData sends strings from frontend)
    const {
      name,
      description,
      price,
      category,
      subCategory,
      isCustomizable,
      stock,
    } = req.body;

    // Handle image (Cloudinary / Multer)
    let imageData = {};
    if (req.file) {
      const result = await uploadCloudinary(req.file.path, "products");
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } else {
      // If you prefer product image to be required, you can throw an error here.
      imageData = {
        url: req.body.image || "https://via.placeholder.com/150",
        publicId: req.body.publicId || "",
      };
    }

    const product = new Product({
      name,
      description,
      price: Number(price) || 0,
      category: category ? category.toLowerCase() : undefined,
      subCategory: subCategory ? subCategory.toLowerCase() : "general",
      isCustomizable: parseBoolean(isCustomizable),
      image: imageData,
      stock: Number(stock) || 0,
    });

    const savedProduct = await product.save();
    res.status(201).json({ success: true, product: savedProduct });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category: category.toLowerCase() });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Normalize category fields if provided
    if (req.body.category) {
      req.body.category = req.body.category.toLowerCase();
    }
    if (req.body.subCategory) {
      req.body.subCategory = req.body.subCategory.toLowerCase();
    }

    // Coerce isCustomizable from form (string "true"/"false") to boolean
    if (req.body.isCustomizable !== undefined) {
      req.body.isCustomizable = parseBoolean(req.body.isCustomizable);
    }

    // If there's a new image file, upload it and delete the old one from Cloudinary (if present)
    if (req.file) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      // Delete old image from Cloudinary if it has a publicId
      if (product.image?.publicId) {
        try {
          await deleteCloudinary(product.image.publicId);
        } catch (err) {
          console.warn("Failed to delete old Cloudinary image:", err.message);
          // do not block update if delete fails
        }
      }

      // Upload new image
      const uploadResult = await uploadCloudinary(req.file.path, "products");
      req.body.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Remove image from Cloudinary
    if (product.image?.publicId) {
      try {
        await deleteCloudinary(product.image.publicId);
      } catch (err) {
        console.warn("Cloudinary delete failed:", err.message);
        // continue with deletion even if cloudinary delete fails
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
