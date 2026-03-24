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


cartRouter.post("/add", isAuth, upload.single("customImage"), addToCart);

cartRouter.get("/getCart", isAuth, getUserCart);


cartRouter.put("/update", isAuth, updateCart);

cartRouter.delete("/clearCart", isAuth, clearCart);

cartRouter.delete("/:cartItemId", isAuth, removeFromCart);