import React, { useContext, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ItemDataContext } from "../context/ItemContext";
import Card from "../components/Card";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

const Products = () => {
  const { category, subCategory } = useParams();
  const { items = [] } = useContext(ItemDataContext);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // dropdown open/close states
  const [openDropdown, setOpenDropdown] = useState(null);

  // ---------------- Filtering ----------------
  let filtered = items.filter((p) => {
    if (category && subCategory) {
      return (
        p.category?.toLowerCase() === category.toLowerCase() &&
        p.subCategory?.toLowerCase() === subCategory.toLowerCase()
      );
    } else if (category) {
      return p.category?.toLowerCase() === category.toLowerCase();
    }
    return true;
  });

  filtered = filtered.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery)
  );

  filtered = filtered.filter((p) => {
    if (priceRange === "lt200") return p.price < 200;
    if (priceRange === "200to500") return p.price >= 200 && p.price <= 500;
    if (priceRange === "500to999") return p.price >= 500 && p.price <= 999;
    if (priceRange === "gt1000") return p.price > 1000;
    return true;
  });

  if (sortBy === "Name") {
    filtered.sort((a, b) =>
      sortOrder === "desc"
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name)
    );
  } else if (sortBy === "Price") {
    filtered.sort((a, b) =>
      sortOrder === "desc" ? b.price - a.price : a.price - b.price
    );
  }

  // ✅ Helper to format category name
  const formatName = (name) => {
    if (!name) return "All Products";
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // ✅ Dropdown component
  const Dropdown = ({ label, value, options, onChange, id }) => (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
        className="w-full sm:w-40 flex justify-between items-center border px-3 py-2 rounded bg-white shadow-sm text-sm font-medium"
      >
        {value ? options.find((o) => o.value === value)?.label : label}
        <span className="ml-2">▾</span>
      </button>

      <AnimatePresence>
        {openDropdown === id && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg overflow-hidden"
          >
            {options.map((opt, index) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpenDropdown(null);
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  index !== 0 ? "border-t" : ""
                }`}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Header Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F0D800] py-3 px-6">
          {/* Left - Category Name */}
          <div className="flex flex-row items-center text-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="mb-0 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <FaArrowLeft size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 capitalize">
              {formatName(subCategory || category)}
            </h2>
          </div>

          {/* Right - Filters (lg screens) */}
          <div className="hidden md:flex items-center gap-3">
            <Dropdown
              id="price"
              label="All Prices"
              value={priceRange}
              onChange={setPriceRange}
              options={[
                { value: "", label: "All Prices" },
                { value: "lt200", label: "Less than ₹200" },
                { value: "200to500", label: "₹200 - ₹500" },
                { value: "500to999", label: "₹500 - ₹999" },
                { value: "gt1000", label: "Above ₹1000" },
              ]}
            />
            <Dropdown
              id="sortBy"
              label="Sort By"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "", label: "Sort By" },
                { value: "Name", label: "Name" },
                { value: "Price", label: "Price" },
              ]}
            />
            <Dropdown
              id="order"
              label="Order"
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: "", label: "Order" },
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
            />
          </div>

          {/* Toggle Button (sm + md) */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="md:hidden text-sm font-medium px-4 py-2 bg-white rounded shadow"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filters below (only on sm+md when toggled) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col gap-4 md:hidden"
            >
              <Dropdown
                id="m-price"
                label="All Prices"
                value={priceRange}
                onChange={setPriceRange}
                options={[
                  { value: "", label: "All Prices" },
                  { value: "lt200", label: "Less than ₹200" },
                  { value: "200to500", label: "₹200 - ₹500" },
                  { value: "500to999", label: "₹500 - ₹999" },
                  { value: "gt1000", label: "Above ₹1000" },
                ]}
              />
              <Dropdown
                id="m-sortBy"
                label="Sort By"
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "", label: "Sort By" },
                  { value: "Name", label: "Name" },
                  { value: "Price", label: "Price" },
                ]}
              />
              <Dropdown
                id="m-order"
                label="Order"
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  { value: "", label: "Order" },
                  { value: "asc", label: "Ascending" },
                  { value: "desc", label: "Descending" },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products Grid */}
      <div className="pt-[55px] p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-[50px]">
          {filtered.length > 0 ? (
            filtered.map((item) => <Card key={item._id} product={item} />)
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No products found {searchQuery && `for "${searchQuery}"`}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
