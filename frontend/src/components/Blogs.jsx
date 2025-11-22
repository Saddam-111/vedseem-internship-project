// Blogs.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import BlogCard from "./BlogCard";
import { ProductDataContext } from "../context/ProductContext";

const Blogs = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const {blogData} = useContext(ProductDataContext)

  // Update currentIndex on scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const cardWidth = container.firstChild.offsetWidth + 24; // gap-6 = 24px
    const index = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(index);
  };

  const handleDotClick = (index) => {
    const container = containerRef.current;
    const cardWidth = container.firstChild.offsetWidth + 24;
    container.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-[80%] mx-auto px-4 py-4">
      <h1 className="text-3xl font-bold mb-6">Our Blogs</h1>

      {/* Horizontal Scrollable Blog Cards */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-6 "
      >
        {blogData.map((blog, index) => (
          <div
            key={index}
            className="snap-start max-w-[90%] sm:max-w-[90%] md:min-w-[95%] lg:min-w-[50%] flex-shrink-0"
          >
            <BlogCard blog={blog} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex w-[80%] mx-auto justify-center mt-6 gap-2">
        {blogData.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={() => handleDotClick(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
