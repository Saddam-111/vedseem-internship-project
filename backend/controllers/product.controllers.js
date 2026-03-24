
import { uploadCloudinary, deleteCloudinary } from '../config/cloudinary.js';
import Product from '../models/product.model.js';

const parseBoolean = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true' || val === '1';
  }
  return false;
};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      isCustomizable,
      stock,
    } = req.body;

    
    let imageData = {};
    if (req.file) {
      const result = await uploadCloudinary(req.file.path, "products");
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } else {
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


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


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


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

 
    if (req.body.category) {
      req.body.category = req.body.category.toLowerCase();
    }
    if (req.body.subCategory) {
      req.body.subCategory = req.body.subCategory.toLowerCase();
    }

    if (req.body.isCustomizable !== undefined) {
      req.body.isCustomizable = parseBoolean(req.body.isCustomizable);
    }

    if (req.file) {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (product.image?.publicId) {
        try {
          await deleteCloudinary(product.image.publicId);
        } catch (err) {
          console.warn("Failed to delete old Cloudinary image:", err.message);
         
        }
      }

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


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.image?.publicId) {
      try {
        await deleteCloudinary(product.image.publicId);
      } catch (err) {
        console.warn("Cloudinary delete failed:", err.message);
        
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
