import React, { useContext, useEffect } from "react";
import { CartDataContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

const Cart = () => {
  const { cart, removeFromCart, updateCartItem, clearCart } = useContext(CartDataContext);
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  // Empty Cart Page
  if (!cart.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white border rounded-full hover:shadow-md transition"
        >
          <FaArrowLeft size={18} />
        </button>

        <h2 className="text-gray-700 text-xl mb-2 font-semibold">Your Cart is Empty 🛒</h2>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 max-w-8xl min-h-screen pb-32">
      <div className=" mx-auto p-4">

        {/* Header */}
        <div className="flex items-center bg-yellow-400 p-3 rounded-md gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-full hover:shadow-md transition"
            aria-label="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition p-4 flex flex-col sm:flex-row gap-4"
            >
              {/* Product image */}
              <div className="flex justify-center">
                <img
                  src={item.image?.url || item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  width={80}
                  height={80}
                />
              </div>

              {/* Product info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-2">
                    {item.name}
                  </h2>
                  <p className="text-gray-700 font-medium mt-1">₹{item.price}</p>

                  {/* Customisation block */}
                  {item.customization && (item.customization.text || item.customization.image) && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Customization:</h4>

                      <div className="flex items-center gap-2">
                        {item.customization.image && (
                          <img
                            src={item.customization.image.url || item.customization.image}
                            alt="Custom"
                            className="w-12 h-12 rounded border object-cover"
                          />
                        )}
                        {item.customization.text && (
                          <p className="text-gray-800 text-sm italic">
                            “{item.customization.text}”
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => updateCartItem(item._id, item.quantity - 1)}
                    className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-semibold rounded bg-gray-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartItem(item._id, item.quantity + 1)}
                    className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price + Remove */}
              <div className="flex flex-row sm:flex-col justify-between items-end sm:items-end w-full sm:w-auto">
                <p className="font-semibold text-gray-900 mb-2 sm:mb-4">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-white bg-red-600 px-3 py-2 rounded-md hover:bg-red-700 transition flex items-center gap-2"
                >
                  <FaTrash size={14} />
                  <span className="hidden sm:inline-block text-sm">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              Total: ₹{total.toFixed(2)}
            </h2>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="px-5 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Clear Cart
              </button>

              <button
                onClick={() => navigate("/checkout")}
                className="px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
