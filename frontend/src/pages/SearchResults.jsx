import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext";

export default function SearchResults() {
  const { items = [] } = useContext(ItemDataContext);

  // Read query param (consistent with SearchBar)
  const query = new URLSearchParams(useLocation().search).get("search") || "";

  // Filter products
  const results = items.filter((item) =>
    (item.name || item.title || "")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="md:p-6 px-3 md:max-w-6xl mx-auto mt-[5rem]">
      <h2 className="text-2xl font-bold mb-4 px-2">
        Search Results for "{query}" ({results.length})
      </h2>

      {results.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((item) => (
            <Link
              key={item._id}
              to={`/product/${item._id}`} // ✅ use id for product details route
              className="rounded-lg p-3 shadow-md hover:shadow-lg transition"
            >
              <img
                src={item.image?.url || item.image}
                alt={item.name || item.title}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-semibold mt-2">
                {item.name || item.title}
              </h3>
              <p className="text-green-600 font-bold">
                ₹{item.price || item.amount}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
