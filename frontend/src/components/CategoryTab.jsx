import React, { useState } from "react";
import { Link } from "react-router-dom";

const CategoryTab = () => {
  const [selected, setSelected] = useState("birthday");

  const section = [
    { name: "BIRTHDAY", slug: "birthday" },
    { name: "ANNIVERSARY", slug: "anniversary" },
    { name: "CONGRATULATION", slug: "congratulation" },
    { name: "THANKS", slug: "thanks" },
  ];

  return (
    <div className="w-[90%] mx-auto mt-4 bg-yellow-300 rounded-full flex flex-wrap justify-around gap-4 py-2 px-4">
      {section.map((item, index) => (
        <Link
          key={index}
          to={`/products/category/${item.slug}`} // ✅ navigate by slug
          onClick={() => setSelected(item.slug)}
          className={`px-4 py-2 text-lg font-medium rounded-full transition-all duration-300 ${
            selected === item.slug
              ? "bg-white text-black shadow-md"
              : "bg-transparent text-gray-800 hover:bg-white/60"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default CategoryTab;
