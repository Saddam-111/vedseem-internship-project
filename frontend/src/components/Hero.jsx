import React from "react";
import { useNavigate } from "react-router-dom";
import { heroImage } from "../assets/assets";
import { FaArrowRight } from "react-icons/fa";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-6">
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img
          src={heroImage.hero}
          alt="Special Offers"
          className="w-full h-auto object-cover max-h-[500px]"
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
          <div className="px-8 md:px-16 py-12 max-w-xl">
            <span className="inline-block bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
              🎁 Free Shipping on Orders Above ₹499
            </span>
            <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight mb-4">
              Perfect Gifts for Every Occasion
            </h1>
            <p className="text-gray-200 text-lg mb-6">
              Discover our collection of personalized gifts that make moments memorable.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full hover:bg-yellow-500 transition transform hover:scale-105"
              >
                Shop Now <FaArrowRight />
              </button>
              <button
                onClick={() => navigate("/products?search=gifts")}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-full hover:bg-white/30 transition"
              >
                View Categories
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm py-3 px-8 flex justify-center gap-8 md:gap-16">
          <div className="text-center">
            <span className="text-yellow-400 text-xl">🚚</span>
            <p className="text-white text-xs mt-1">Free Delivery</p>
          </div>
          <div className="text-center">
            <span className="text-yellow-400 text-xl">🎁</span>
            <p className="text-white text-xs mt-1">Personalized</p>
          </div>
          <div className="text-center">
            <span className="text-yellow-400 text-xl">⭐</span>
            <p className="text-white text-xs mt-1">4.8 Rating</p>
          </div>
          <div className="text-center">
            <span className="text-yellow-400 text-xl">🔄</span>
            <p className="text-white text-xs mt-1">Easy Returns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;