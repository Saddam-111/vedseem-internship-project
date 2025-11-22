import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import male from "../assets/male.png";
import female from "../assets/female.png";
import { ItemDataContext } from "../context/ItemContext"; // Assuming you have this

const GenderCategory = () => {
  const { items } = useContext(ItemDataContext); // All products
  const [selected, setSelected] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  const genderList = [
    { name: "Men", slug: "gifts-for-men", image: male },
    { name: "Women", slug: "gifts-for-women", image: female },
  ];

  const handleSelect = (slug) => {
    setSelected(slug);

    // Filter products based on subCategory
    const filtered = items.filter(
      (item) => item.subCategory?.toLowerCase() === slug.toLowerCase()
    );
    setFilteredProducts(filtered);

    // Navigate to products page with category/subCategory
    navigate(`/products/category/${slug}`);
  };

  return (
    <>
      <div className="w-[90%] flex justify-center gap-20 mx-auto pb-8 pt-6">
        {genderList.map((item) => (
          <div
            key={item.slug}
            onClick={() => handleSelect(item.slug)}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
              selected === item.slug ? "scale-105" : "opacity-80 hover:opacity-100"
            }`}
          >
            <div
              className={`p-3 border-4 transition-all ${
                selected === item.slug ? "shadow-lg" : "border-transparent"
              }`}
            >
              <img src={item.image} alt={item.name} className="object-contain" />
            </div>
            <p
              className={`mt-2 text-lg font-semibold ${
                selected === item.slug ? "text-yellow-600" : "text-gray-700"
              }`}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>

      {/* Optional: Display filtered products right here */}
      {filteredProducts.length > 0 && (
        <div className="w-[90%] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <img
                src={product.image?.url}
                alt={product.name}
                className="w-full h-40 object-cover mb-2 rounded"
              />
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-gray-600">₹ {product.price}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default GenderCategory;
