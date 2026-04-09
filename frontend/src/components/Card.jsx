import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaShoppingCart, FaEye } from "react-icons/fa";
import { useContext } from "react";
import { CartDataContext } from "../context/CartContext";

const Card = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartDataContext);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const formData = new FormData();
    formData.append("productId", product._id);
    formData.append("quantity", 1);
    addToCart(formData);
  };

  const handleView = (e) => {
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-yellow-400"
    >
      {/* Product Image Container */}
      <div className="relative h-56 overflow-hidden bg-gray-50">
        <img
          src={product.image?.url || "https://via.placeholder.com/300"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Stock Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
          product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={handleView}
            className="bg-white p-3 rounded-full hover:bg-yellow-400 hover:text-white transition-all transform hover:scale-110"
            title="Quick View"
          >
            <FaEye className="text-gray-700" />
          </button>
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="bg-white p-3 rounded-full hover:bg-yellow-400 hover:text-white transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add to Cart"
          >
            <FaShoppingCart className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-yellow-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-xs ${i < Math.round(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-bold text-pink-600">₹{product.price}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>

        {/* Category Tag */}
        {product.category && (
          <div className="mt-3">
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full capitalize">
              {product.category.replace(/-/g, ' ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
