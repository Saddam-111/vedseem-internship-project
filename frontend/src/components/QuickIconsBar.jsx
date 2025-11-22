import React from "react";
import { Link } from "react-router-dom";
import { icons } from "../assets/assets";

const QuickIconsBar = () => {
  return (
    <div className="w-[99%] flex flex-row border-2 justify-center py-2 rounded-md overflow-x-auto scrollbar-hide mx-auto bg-white shadow-sm">
      {icons.map((icon, index) => (
        <Link
          key={index}
          to={`/products/category/${icon.slug}`}  // ✅ corrected route
          className={`flex flex-col items-center flex-1 px-3 ${
            index !== 0 ? "border-l-2" : ""
          } hover:bg-gray-50 transition`}
        >
          <img
            className="max-h-[40px] hover:scale-105 transition cursor-pointer"
            src={icon.image}
            alt={icon.label}
          />
          <span className="text-xs mt-1 text-gray-600 hidden lg:inline">{icon.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default QuickIconsBar;
