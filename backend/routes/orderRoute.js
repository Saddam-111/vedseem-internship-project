import express from "express";
import { 
  createOrder, 
  getMyOrders, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/order.controllers.js";
import { isAuth } from "../middleware/isAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";

export const orderRouter = express.Router();

// User routes
orderRouter.post("/create", isAuth, createOrder);
orderRouter.get("/myOrders", isAuth, getMyOrders);
orderRouter.put("/cancel/:orderId", isAuth, cancelOrder);

// Razorpay routes
orderRouter.post("/razorpay/order", isAuth, createRazorpayOrder);
orderRouter.post("/razorpay/verify", isAuth, verifyRazorpayPayment);

// Admin routes
orderRouter.get("/all", adminAuth, getAllOrders);
orderRouter.put("/status/:id", adminAuth, updateOrderStatus);