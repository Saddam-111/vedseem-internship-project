import React, { useContext, useState } from "react";
import { CartDataContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import { motion } from "framer-motion";

const Cart = () => {
  const { cart, removeFromCart, updateCartItem, clearCart } = useContext(CartDataContext);
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear all items from your cart?")) {
      setIsClearing(true);
      clearCart();
      setTimeout(() => setIsClearing(false), 500);
    }
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-500 transition shadow-lg hover:shadow-xl"
          >
            Start Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
              <p className="text-sm text-gray-500">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-600 text-sm font-medium px-4 py-2"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.image?.url || item.image || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-gray-100"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900 text-lg line-clamp-2">
                      {item.name}
                    </h2>
                    <p className="text-pink-600 font-bold mt-1">₹{item.price}</p>

                    {/* Customization */}
                    {item.customization && (item.customization.text || item.customization.image) && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-yellow-700 mb-2">🎁 Personalization:</h4>
                        <div className="flex items-center gap-2">
                          {item.customization.image && (
                            <img
                              src={item.customization.image.url || item.customization.image}
                              alt="Custom"
                              className="w-10 h-10 rounded border object-cover"
                            />
                          )}
                          {item.customization.text && (
                            <p className="text-gray-800 text-sm italic">
                              "{item.customization.text}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => updateCartItem(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:bg-gray-200 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="px-4 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm hover:bg-gray-200"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex-shrink-0 flex flex-col items-end justify-between">
                  <p className="font-bold text-xl text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <FaShoppingBag />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
