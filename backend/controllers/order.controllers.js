import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';

// ✅ Create COD Order
export const createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body;
    const userId = req.userId; // from auth middleware

    console.log("=== CREATE ORDER DEBUG ===");
    console.log("UserId:", userId);
    console.log("Received items:", JSON.stringify(items, null, 2));
    console.log("Address:", address);
    console.log("Payment method:", paymentMethod);

    // ✅ Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "Items array is required and cannot be empty" 
      });
    }

    if (!address) {
      return res.status(400).json({ 
        message: "Address is required" 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        message: "User authentication required" 
      });
    }

    // ✅ Validate and fetch product details
    const orderItems = [];
    let totalAmount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing item ${i}:`, item);

      if (!item.productId) {
        return res.status(400).json({ 
          message: `Product ID is missing for item at index ${i}` 
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        console.log(`Product not found for ID: ${item.productId}`);
        return res.status(404).json({ 
          message: `Product not found: ${item.productId}` 
        });
      }

      console.log(`Found product:`, product.name);

      // ✅ FIXED: Handle image structure properly
      let imageData;
      if (item.image) {
        // If item.image is a string (URL)
        if (typeof item.image === 'string') {
          imageData = {
            url: item.image,
            publicId: ""
          };
        }
        // If item.image is an object with url property
        else if (item.image.url) {
          imageData = {
            url: item.image.url,
            publicId: item.image.publicId || ""
          };
        }
        // If item.image is an object but no url property
        else {
          imageData = {
            url: item.image,
            publicId: ""
          };
        }
      }
      // Fallback to product image
      else if (product.image) {
        if (typeof product.image === 'string') {
          imageData = {
            url: product.image,
            publicId: ""
          };
        } else {
          imageData = {
            url: product.image.url || product.image,
            publicId: product.image.publicId || ""
          };
        }
      }
      // Default fallback
      else {
        imageData = {
          url: "https://via.placeholder.com/150",
          publicId: ""
        };
      }

      console.log(`Image data for item ${i}:`, imageData);

      // ✅ Build order item with customization
      const orderItem = {
        productId: product._id,
        name: item.name || product.name,
        quantity: item.quantity || 1,
        price: item.price || product.price,
        image: imageData, // ✅ Properly structured image object
      };

      // ✅ Add customization if present
      if (item.customization) {
        console.log("Adding customization:", item.customization);
        orderItem.customization = item.customization;
      }

      orderItems.push(orderItem);
      totalAmount += orderItem.price * orderItem.quantity;
    }

    console.log("Final order items:", JSON.stringify(orderItems, null, 2));
    console.log("Total amount:", totalAmount);

    // ✅ Create order
    const newOrder = new Order({
      userId,
      items: orderItems,
      amount: totalAmount,
      address,
      paymentMethod: paymentMethod || "COD",
      payment: paymentMethod === "COD" ? false : true,
    });

    console.log("About to save order:", JSON.stringify(newOrder, null, 2));
    await newOrder.save();
    console.log("Order saved successfully");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Failed to create order",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// ✅ Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ✅ Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId: req.userId, status: "Order Placed" },
      { status: "Cancelled" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        message: "Order not found or cannot be cancelled" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

// ✅ Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create Razorpay Order (before checkout)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
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
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
};

// ✅ Verify Razorpay Payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // ✅ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ Process order items with customization
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of orderData.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.productId}` 
        });
      }

      const orderItem = {
        productId: product._id,
        name: item.name || product.name,
        price: item.price || product.price,
        quantity: item.quantity,
        image: item.image || product.image,
      };

      // ✅ Add customization if present
      if (item.customization) {
        orderItem.customization = item.customization;
      }

      enrichedItems.push(orderItem);
      totalAmount += orderItem.price * orderItem.quantity;
    }

    // ✅ Create order
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