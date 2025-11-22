import express from "express";
import {
  addToCart,
  clearCart,
  getUserCart,
  removeFromCart,
  updateCart,
} from "../controllers/cart.controllers.js";
import { isAuth } from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";

export const cartRouter = express.Router();

// Route for adding an item
cartRouter.post("/add", isAuth, upload.single("customImage"), addToCart);

// Route for getting the cart
cartRouter.get("/getCart", isAuth, getUserCart);

// Route for updating quantity
cartRouter.put("/update", isAuth, updateCart);

// Route for clearing the entire cart
cartRouter.delete("/clearCart", isAuth, clearCart);

// Route for removing a single item by its unique cart item ID
cartRouter.delete("/:cartItemId", isAuth, removeFromCart);