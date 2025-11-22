import React, { useState, useEffect } from "react";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { gifts } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const GiftSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const navigate = useNavigate();

  // Update number of items per view based on screen size
  const updateItemsPerView = () => {
    if (window.innerWidth < 400) return setItemsPerView(2);
    if (window.innerWidth < 640) return setItemsPerView(3);
    if (window.innerWidth < 1024) return setItemsPerView(4);
    return setItemsPerView(4);
  };

  useEffect(() => {
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const totalPages = Math.ceil(gifts.length / itemsPerView);

  const scrollLeft = () => {
    setCurrentIndex(
      currentIndex - itemsPerView < 0
        ? (totalPages - 1) * itemsPerView
        : currentIndex - itemsPerView
    );
  };

  const scrollRight = () => {
    setCurrentIndex(
      currentIndex + itemsPerView >= gifts.length
        ? 0
        : currentIndex + itemsPerView
    );
  };

  // Determine visible items and wrap around if needed
  const visibleItems = gifts.slice(currentIndex, currentIndex + itemsPerView);
  if (visibleItems.length < itemsPerView) {
    visibleItems.push(...gifts.slice(0, itemsPerView - visibleItems.length));
  }

  const currentPage = Math.floor(currentIndex / itemsPerView);

  return (
    <div className="w-[88%] mx-auto flex flex-col items-center justify-center pt-2 relative px-2 sm:px-4 lg:px-6">
      {/* Carousel Container */}
      <div className="w-full flex items-center justify-center relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-1 sm:left-2 z-20 bg-white rounded-full shadow-md hover:scale-105 transition"
        >
          <FaChevronCircleLeft size={32} className="text-gray-700" />
        </button>

        {/* Carousel Items */}
        <div className="flex overflow-hidden gap-3 sm:gap-4 px-6 py-2">
          {visibleItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/products/category/${item.slug}`)}
              className="flex flex-col items-center w-[90px] sm:w-[120px] md:w-[150px] lg:w-[170px] cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.text}
                className="w-full h-[60px] sm:h-[60px] md:h-[50px] lg:h-[60px] object-contain rounded-md"
              />
              <p className="mt-2 text-center text-xs sm:text-sm md:text-base">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-1 sm:right-2 z-20 bg-white rounded-full shadow-md hover:scale-105 transition"
        >
          <FaChevronCircleRight size={32} className="text-gray-700" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-1">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              idx === currentPage ? "bg-gray-800" : "bg-gray-400"
            }`}
            onClick={() => setCurrentIndex(idx * itemsPerView)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default GiftSection;
