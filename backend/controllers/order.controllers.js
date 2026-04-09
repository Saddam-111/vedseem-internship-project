import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';

const getIO = (req) => req.app.get('io');


export const createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body;
    const userId = req.userId; 

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Items array is required and cannot be empty" 
      });
    }

    if (!address || !address.firstName || !address.phone || !address.street || !address.city) {
      return res.status(400).json({ 
        success: false,
        message: "Complete delivery address is required" 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "User authentication required" 
      });
    }

    if (!paymentMethod || !['COD', 'RAZORPAY'].includes(paymentMethod.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Valid payment method is required"
      });
    }
    
    const orderItems = [];
    let totalAmount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.productId) {
        return res.status(400).json({ 
          success: false,
          message: `Product ID is missing for item at index ${i}` 
        });
      }

      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `Product not found: ${item.productId}` 
        });
      }

      if (product.stock < (item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }
      
      let imageData;
      if (item.image) {
        if (typeof item.image === 'string') {
          imageData = { url: item.image, publicId: "" };
        } else if (item.image.url) {
          imageData = { url: item.image.url, publicId: item.image.publicId || "" };
        } else {
          imageData = { url: item.image, publicId: "" };
        }
      } else if (product.image) {
        if (typeof product.image === 'string') {
          imageData = { url: product.image, publicId: "" };
        } else {
          imageData = { url: product.image.url || product.image, publicId: product.image.publicId || "" };
        }
      } else {
        imageData = { url: "https://via.placeholder.com/150", publicId: "" };
      }

      const quantity = item.quantity || 1;
      const price = item.price || product.price;
      
      const orderItem = {
        productId: product._id,
        name: item.name || product.name,
        quantity: quantity,
        price: price,
        image: imageData, 
      };

      if (item.customization) {
        orderItem.customization = item.customization;
      }

      orderItems.push(orderItem);
      totalAmount += price * quantity;

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -quantity }
      });
    }

    const newOrder = new Order({
      userId,
      items: orderItems,
      amount: totalAmount,
      address,
      paymentMethod: paymentMethod.toUpperCase(),
      payment: paymentMethod.toUpperCase() !== "COD",
    });

    await newOrder.save();

    // Emit real-time event to admin
    const io = getIO(req);
    if (io) {
      io.to('admin').emit('new-order', {
        orderId: newOrder._id,
        amount: newOrder.amount,
        customer: `${newOrder.address.firstName} ${newOrder.address.lastName}`,
        items: newOrder.items.length,
        createdAt: newOrder.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create order",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.userId })
        .populate('items.productId', 'name image price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId: req.userId })
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders" 
    });
  }
};


export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.userId 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({ 
        success: false,
        message: "Order cannot be cancelled at this stage" 
      });
    }

    order.status = "Cancelled";
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to cancel order" 
    });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = status ? { status } : {};
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "firstName lastName email phone")
        .populate("items.productId", "name image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({ 
      success: true, 
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    if (status === "Cancelled" && oldStatus !== "Cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // Emit real-time event
    const io = getIO(req);
    if (io) {
      io.to('admin').emit('order-updated', {
        orderId: order._id,
        status: status,
        oldStatus: oldStatus,
        updatedAt: order.updatedAt
      });
    }

    res.json({ 
      success: true, 
      message: "Order status updated",
      order 
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};


export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount)) {
      return res.status(400).json({ success: false, message: "Amount is required and must be a valid number" });
    }

    console.log("Creating Razorpay order with:", {
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: Math.round(parsedAmount * 100),
      currency: "INR"
    });

    const options = {
      amount: Math.round(parsedAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Razorpay order creation failed",
      error: error.description || error.message 
    });
  }
};


export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

  
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of orderData.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.productId}` 
        });
      }

      if (product.stock < (item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      let imageData;
      if (item.image) {
        if (typeof item.image === 'string') {
          imageData = { url: item.image, publicId: "" };
        } else if (item.image.url) {
          imageData = { url: item.image.url, publicId: item.image.publicId || "" };
        } else {
          imageData = { url: item.image, publicId: "" };
        }
      } else if (product.image) {
        if (typeof product.image === 'string') {
          imageData = { url: product.image, publicId: "" };
        } else {
          imageData = { url: product.image.url || product.image, publicId: product.image.publicId || "" };
        }
      } else {
        imageData = { url: "https://via.placeholder.com/150", publicId: "" };
      }

      const quantity = item.quantity || 1;
      const orderItem = {
        productId: product._id,
        name: item.name || product.name,
        price: item.price || product.price,
        quantity: quantity,
        image: imageData,
      };

      
      if (item.customization) {
        orderItem.customization = item.customization;
      }

      enrichedItems.push(orderItem);
      totalAmount += orderItem.price * orderItem.quantity;

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -quantity }
      });
    }

    
    const newOrder = await Order.create({
      userId: req.userId,
      items: enrichedItems,
      amount: totalAmount,
      address: orderData.address,
      paymentMethod: "RAZORPAY",
      payment: true,
      razorpay_order_id,
    });

    res.status(201).json({ 
      success: true, 
      message: "Payment verified and order created",
      order: newOrder 
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};