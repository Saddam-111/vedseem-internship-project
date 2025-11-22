import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext";

const ItemDetails = () => {
  const { slug } = useParams();
  const { items } = useContext(ItemDataContext);

  // Find the item by slug
  const item = items.find((i) => i.slug === slug);

  if (!item) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Item not found!
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="w-full max-h-96 object-cover rounded-md mb-4"
        />
      )}
      <p className="text-gray-700 text-lg">{item.description}</p>
    </div>
  );
};

export default ItemDetails;
