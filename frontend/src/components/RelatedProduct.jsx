import React, { useContext } from "react";
import { ItemDataContext } from "../context/ItemContext";
import Card from "./Card";

const RelatedProduct = ({ currentProduct }) => {
  const { items = [] } = useContext(ItemDataContext);

  // Get related products (same category, different product) limited to 10
  const related = items
    .filter(
      (p) => p.category === currentProduct.category && p._id !== currentProduct._id
    )
    .slice(0, 10);

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
        You may also like
      </h2>

      {/* Scrollable Row of Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {related.map((product) => (
          <div key={product._id} className="min-w-[180px] sm:min-w-[220px] flex-shrink-0">
            <Card product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProduct;
