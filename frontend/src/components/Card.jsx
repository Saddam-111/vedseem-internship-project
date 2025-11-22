import React from "react";
import { useNavigate } from "react-router-dom";

const Card = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col"
    >
      {/* Product Image */}
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        <img
          src={product.image?.url}
          alt={product.name}
          className="object-contain h-full w-full"
        />
      </div>

      {/* Product Info */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-pink-600 font-bold mt-1">₹{product.price}</p>
      </div>
    </div>
  );
};

export default Card;
