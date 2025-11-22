import express from "express";
import {
  addProduct,
  getProducts,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controllers.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/multer.js";

export const productRouter = express.Router();

// CRUD routes
productRouter.post("/addProduct", upload.single("image") ,adminAuth, addProduct);
productRouter.get("/getProducts", getProducts);
productRouter.get("/category/:category", getProductsByCategory);
productRouter.put("/update/:id", upload.single("image"), adminAuth, updateProduct);
productRouter.delete("/delete/:id",adminAuth, deleteProduct);
