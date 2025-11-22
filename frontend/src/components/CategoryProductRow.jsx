import React, { useState, useEffect } from "react";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { magic } from "../assets/assets";

const ProductCategoryRow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

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

  const totalSlides = Math.ceil(magic.length / itemsPerView);

  const scrollLeft = () => {
    setCurrentIndex((prev) =>
      prev - itemsPerView < 0 ? (totalSlides - 1) * itemsPerView : prev - itemsPerView
    );
  };

  const scrollRight = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerView >= magic.length ? 0 : prev + itemsPerView
    );
  };

  const visibleItems = magic.slice(currentIndex, currentIndex + itemsPerView);
  if (visibleItems.length < itemsPerView) {
    const remainingItems = magic.slice(0, itemsPerView - visibleItems.length);
    visibleItems.push(...remainingItems);
  }

  const activeDot = Math.floor(currentIndex / itemsPerView);

  return (
    <div className="w-[90%] mx-auto flex flex-col items-center justify-center relative mt-4 px-2 sm:px-4 lg:px-6">
      {/* Left Arrow */}
      <button
        onClick={scrollLeft}
        className="absolute left-1 sm:left-2 z-20 bg-white rounded-full shadow-md hover:scale-105 transition"
      >
        <FaChevronCircleLeft size={32} className="text-gray-700" />
      </button>

      {/* Carousel */}
      <div className="flex overflow-hidden gap-3 sm:gap-4 px-6 py-2">
        {visibleItems.map((item, index) => (
          <Link
            key={index}
            to={`/products/category/${item.slug}`} // ✅ route to slug
            className="flex flex-col items-center w-[90px] sm:w-[120px] md:w-[150px] lg:w-[170px] border-[10px] rounded-md border-yellow-300 hover:shadow-md transition"
          >
            <img
              src={item.image}
              alt={item.label}
              className="w-full h-[80px] sm:h-[100px] md:h-[130px] lg:h-[150px] object-contain rounded-md"
            />
            <span className="text-xs sm:text-sm mt-1 font-medium text-gray-700">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-1 sm:right-2 z-20 bg-white rounded-full shadow-md hover:scale-105 transition"
      >
        <FaChevronCircleRight size={32} className="text-gray-700" />
      </button>

      {/* Dots */}
      <div className="flex gap-2 mt-3">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i * itemsPerView)}
            className={`w-3 h-3 rounded-full transition ${
              i === activeDot ? "bg-yellow-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCategoryRow;
