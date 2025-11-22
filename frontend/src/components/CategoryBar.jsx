import React from "react";
import { Link } from "react-router-dom";

const CategoryBar = () => {
  const categoryList = [
    { name: "Personalized Gifts", slug: "personalized-gifts" },
    { name: "Electronics & Gadgets", slug: "electronics-gadgets" },
    { name: "Fashion & Accessories", slug: "fashion-accessories" },
    { name: "Home & Decor", slug: "home-decor" },
    { name: "Food & Beverages", slug: "food-beverages" },
    { name: "Toys & Games", slug: "toys-games" },
    { name: "Wellness & Self-Care", slug: "wellness-selfcare" },
  ];

  return (
    <div className="w-[95%] mx-auto rounded-full bg-[#F0D800] overflow-x-auto scrollbar-hide py-2">
      <div className="max-w-6xl mx-auto flex gap-2 md:gap-4 px-2">
        {categoryList.map((cat) => (
          <Link
            key={cat.slug}
            to={`/products/category/${cat.slug}`} // ✅ Route
            className="whitespace-nowrap px-3 py-2 cursor-pointer rounded-full text-sm md:text-base font-medium text-gray-800 hover:bg-white hover:text-black transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
